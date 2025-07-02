import { NextRequest, NextResponse } from "next/server";
import UserModel from "@/server/models/UserModel";

export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      console.log('Google OAuth callback - Code:', !!code, 'Error:', error);

      // Handle user cancellation
      if (error === 'access_denied') {
         const html = `
            <!DOCTYPE html>
            <html>
            <head><title>Login Cancelled</title></head>
            <body>
               <script>
                  if (window.opener) {
                     window.opener.postMessage({ 
                        type: 'GOOGLE_LOGIN_CANCELLED' 
                     }, '${process.env.NEXT_PUBLIC_BASE_URL}');
                     window.close();
                  } else {
                     window.location.href = '${process.env.NEXT_PUBLIC_BASE_URL}/login';
                  }
               </script>
               <p>Login cancelled. This window should close automatically.</p>
            </body>
            </html>
         `;
         return new NextResponse(html, {
            headers: { 'Content-Type': 'text/html' },
         });
      }

      if (!code) {
         console.error('No code received from Google');
         const html = `
            <!DOCTYPE html>
            <html>
            <head><title>Login Error</title></head>
            <body>
               <script>
                  if (window.opener) {
                     window.opener.postMessage({ 
                        type: 'GOOGLE_LOGIN_ERROR',
                        error: 'No authorization code received'
                     }, '${process.env.NEXT_PUBLIC_BASE_URL}');
                     window.close();
                  } else {
                     window.location.href = '${process.env.NEXT_PUBLIC_BASE_URL}/login?error=no_code';
                  }
               </script>
               <p>Login error. This window should close automatically.</p>
            </body>
            </html>
         `;
         return new NextResponse(html, {
            headers: { 'Content-Type': 'text/html' },
         });
      }

      // Exchange code for access token
      console.log('Exchanging code for token...');
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
         },
         body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            code,
            grant_type: 'authorization_code',
            redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/googleLogin`,
         }),
      });

      const tokenData = await tokenResponse.json();
      console.log('Token exchange result:', tokenResponse.ok);

      if (!tokenResponse.ok) {
         console.error('Token exchange failed:', tokenData);
         const html = `
            <!DOCTYPE html>
            <html>
            <head><title>Login Error</title></head>
            <body>
               <script>
                  if (window.opener) {
                     window.opener.postMessage({ 
                        type: 'GOOGLE_LOGIN_ERROR',
                        error: 'Token exchange failed'
                     }, '${process.env.NEXT_PUBLIC_BASE_URL}');
                     window.close();
                  } else {
                     window.location.href = '${process.env.NEXT_PUBLIC_BASE_URL}/login?error=token_failed';
                  }
               </script>
               <p>Login error. This window should close automatically.</p>
            </body>
            </html>
         `;
         return new NextResponse(html, {
            headers: { 'Content-Type': 'text/html' },
         });
      }

      // Get user info from Google
      console.log('Getting user info from Google...');
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
         headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
         },
      });

      const googleUser = await userResponse.json();
      console.log('Google user info result:', userResponse.ok, googleUser.email);

      if (!userResponse.ok) {
         console.error('User info failed:', googleUser);
         const html = `
            <!DOCTYPE html>
            <html>
            <head><title>Login Error</title></head>
            <body>
               <script>
                  if (window.opener) {
                     window.opener.postMessage({ 
                        type: 'GOOGLE_LOGIN_ERROR',
                        error: 'Failed to get user information'
                     }, '${process.env.NEXT_PUBLIC_BASE_URL}');
                     window.close();
                  } else {
                     window.location.href = '${process.env.NEXT_PUBLIC_BASE_URL}/login?error=user_info_failed';
                  }
               </script>
               <p>Login error. This window should close automatically.</p>
            </body>
            </html>
         `;
         return new NextResponse(html, {
            headers: { 'Content-Type': 'text/html' },
         });
      }

      // Save/update user in database and get JWT token
      console.log('Saving user to database...');
      const jwtToken = await UserModel.loginOrRegisterWithGoogle({
         id: googleUser.id,
         email: googleUser.email,
         name: googleUser.name,
         picture: googleUser.picture
      });

      console.log('User saved successfully, token created');

      // Return success HTML that will communicate with parent window
      const html = `
         <!DOCTYPE html>
         <html>
         <head>
            <title>Login Successful</title>
            <style>
               body { 
                  font-family: Arial, sans-serif; 
                  text-align: center; 
                  padding: 50px; 
                  background: #f0f0f0; 
               }
               .success { color: #28a745; }
            </style>
         </head>
         <body>
            <div class="success">
               <h2>Login Successful!</h2>
               <p>This window will close automatically...</p>
            </div>
            <script>
               console.log('Google login success page loaded');
               
               // Store token in localStorage as backup
               localStorage.setItem('temp_google_token', '${jwtToken}');
               
               // Try to communicate with parent window
               let attempts = 0;
               const maxAttempts = 10;
               
               function sendMessage() {
                  attempts++;
                  console.log('Attempt', attempts, 'to send message to parent');
                  
                  if (window.opener && !window.opener.closed) {
                     console.log('Sending success message to parent window');
                     window.opener.postMessage({ 
                        type: 'GOOGLE_LOGIN_SUCCESS', 
                        token: '${jwtToken}' 
                     }, '${process.env.NEXT_PUBLIC_BASE_URL}');
                     
                     setTimeout(() => {
                        console.log('Closing popup window');
                        window.close();
                     }, 500);
                  } else if (attempts < maxAttempts) {
                     setTimeout(sendMessage, 500);
                  } else {
                     console.log('Failed to communicate with parent, redirecting...');
                     window.location.href = '${process.env.NEXT_PUBLIC_BASE_URL}/login?success=true&token=${jwtToken}';
                  }
               }
               
               // Start attempting to send message
               sendMessage();
            </script>
         </body>
         </html>
      `;

      return new NextResponse(html, {
         headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
         },
      });

   } catch (error) {
      console.error('Google login error:', error);
      const html = `
         <!DOCTYPE html>
         <html>
         <head><title>Login Error</title></head>
         <body>
            <script>
               if (window.opener) {
                  window.opener.postMessage({ 
                     type: 'GOOGLE_LOGIN_ERROR',
                     error: 'Server error occurred'
                  }, '${process.env.NEXT_PUBLIC_BASE_URL}');
                  window.close();
               } else {
                  window.location.href = '${process.env.NEXT_PUBLIC_BASE_URL}/login?error=server_error';
               }
            </script>
            <p>Login error. This window should close automatically.</p>
         </body>
         </html>
      `;
      return new NextResponse(html, {
         headers: { 'Content-Type': 'text/html' },
      });
   }
}