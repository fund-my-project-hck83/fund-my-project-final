import { redirect } from "next/navigation"
import { getCookie } from "../login/action";

interface IProps {
  children: React.ReactNode;
}

export default async function CreateProjectLayout(props: IProps) {
  const token = await getCookie("access_token");
  if (!token) redirect("/login");

  return (
    <div>
        {props.children}
    </div>
  )
}
