"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormWrapper, {
  ProjectFormData,
} from "@/components/ProjectForm/FormWrapper";
import Page1BasicInfo from "@/components/ProjectForm/Page1BasicInfo";
import Page2Impact from "@/components/ProjectForm/Page2Impact";
import Page3Fundraising from "@/components/ProjectForm/Page3Fundraising";
import Page4Proposal from "@/components/ProjectForm/Page4Proposal";

interface SwotInsight {
  title: string;
  description: string;
  excerpt: string;
  badge: string;
  type: "strength" | "weakness" | "opportunities" | "threat";
}

export default function AddProjectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState<ProjectFormData>({
    // Page 1
    name: "",
    description: "",
    projectStartDate: "",
    projectEndDate: "",
    location: "",

    // Page 2
    impactMetrics: [
      { number: "", description: "" },
      { number: "", description: "" },
      { number: "", description: "" },
    ],
    projectImageUrl: "",

    // Page 3
    fundingGoal: "",
    fundraisingStartDate: "",
    fundraisingEndDate: "",

    // Page 4
    proposalType: null,
    proposalUrl: "",
    aiProposal: "",
    aiInsights: null,
  });

  const updateFormData = (data: Partial<ProjectFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    // Clear related errors when user updates fields
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(data).forEach((key) => {
        delete newErrors[key];
      });
      return newErrors;
    });
  };

  // Validation functions
  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = "Project name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.projectStartDate)
      newErrors.projectStartDate = "Start date is required";
    if (!formData.projectEndDate)
      newErrors.projectEndDate = "End date is required";

    if (formData.projectStartDate && formData.projectEndDate) {
      if (
        new Date(formData.projectStartDate) >= new Date(formData.projectEndDate)
      ) {
        newErrors.projectEndDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};

    formData.impactMetrics.forEach((metric, index) => {
      if (!metric.number || Number(metric.number) <= 0) {
        newErrors[`impactMetrics.${index}.number`] = "Valid number required";
      }
      if (!metric.description.trim()) {
        newErrors[`impactMetrics.${index}.description`] =
          "Description required";
      }
    });

    if (!formData.projectImageUrl.trim()) {
      newErrors.projectImageUrl = "Project image URL is required";
    } else {
      try {
        new URL(formData.projectImageUrl);
      } catch {
        newErrors.projectImageUrl = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.fundingGoal || Number(formData.fundingGoal) <= 0) {
      newErrors.fundingGoal = "Valid funding goal is required";
    }
    if (!formData.fundraisingStartDate) {
      newErrors.fundraisingStartDate = "Start date is required";
    }
    if (!formData.fundraisingEndDate) {
      newErrors.fundraisingEndDate = "End date is required";
    }

    if (formData.fundraisingStartDate && formData.fundraisingEndDate) {
      if (
        new Date(formData.fundraisingStartDate) >=
        new Date(formData.fundraisingEndDate)
      ) {
        newErrors.fundraisingEndDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.proposalType) {
      newErrors.proposal = "Please choose a proposal method";
    } else if (
      formData.proposalType === "upload" &&
      !formData.proposalUrl.trim()
    ) {
      newErrors.proposalUrl = "Proposal URL is required";
    } else if (formData.proposalType === "ai" && !formData.aiProposal) {
      newErrors.aiProposal = "Please generate AI proposal";
    }

    if (!formData.aiInsights) {
      newErrors.aiInsights =
        "AI insights are required - please generate SWOT analysis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation handlers
  const handleNext = async () => {
    let isValid = false;

    switch (currentStep) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
      case 4:
        isValid = validateStep4();
        if (isValid) {
          await handleSubmit();
          return;
        }
        break;
    }

    if (isValid && currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Final submission
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const projectData = {
        name: formData.name,
        description: formData.description,
        fundingGoal: Number(formData.fundingGoal),
        fundraisingStartDate: formData.fundraisingStartDate,
        fundraisingEndDate: formData.fundraisingEndDate,
        projectStartDate: formData.projectStartDate,
        projectEndDate: formData.projectEndDate,
        location: formData.location,
        projectImageUrl: formData.projectImageUrl,
        impactMetrics: formData.impactMetrics.map((m) => ({
          number: Number(m.number),
          description: m.description,
        })),
        // Add AI-generated content
        aiProposal: formData.aiProposal || undefined,
        proposalDocumentUrl: formData.proposalUrl || undefined,
        aiInsights: formData.aiInsights
          ? {
              strength: formData.aiInsights.find(
                (i: SwotInsight) => i.type === "strength"
              ),
              weakness: formData.aiInsights.find(
                (i: SwotInsight) => i.type === "weakness"
              ),
              opportunities: formData.aiInsights.find(
                (i: SwotInsight) => i.type === "opportunities"
              ),
              threat: formData.aiInsights.find(
                (i: SwotInsight) => i.type === "threat"
              ),
            }
          : undefined,
      };

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();

      if (response.ok) {
        router.push(`/projects/${result.slug}`);
      } else {
        console.error("Error:", result.error);
        alert("Failed to create project. Please try again.");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Determine if we can proceed
  const canGoNext = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(
          formData.name.trim() &&
          formData.description.trim() &&
          formData.location.trim() &&
          formData.projectStartDate &&
          formData.projectEndDate
        );
      case 2:
        return !!(
          formData.impactMetrics.every(
            (m) => m.number.trim() && m.description.trim()
          ) && formData.projectImageUrl.trim()
        );
      case 3:
        return !!(
          formData.fundingGoal.trim() &&
          formData.fundraisingStartDate &&
          formData.fundraisingEndDate
        );
      case 4:
        return !!(
          (formData.proposalUrl.trim() || formData.aiProposal.trim()) &&
          formData.aiInsights
        );
      default:
        return false;
    }
  };

  const renderCurrentPage = () => {
    switch (currentStep) {
      case 1:
        return (
          <Page1BasicInfo
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        );
      case 2:
        return (
          <Page2Impact
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        );
      case 3:
        return (
          <Page3Fundraising
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        );
      case 4:
        return (
          <Page4Proposal
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  return (
    <FormWrapper
      currentStep={currentStep}
      totalSteps={4}
      onNext={handleNext}
      onBack={handleBack}
      canGoNext={canGoNext()}
      canGoBack={currentStep > 1}
      nextButtonText={currentStep === 4 ? "Complete Project" : "Next"}
      isLoading={loading}
    >
      {renderCurrentPage()}
    </FormWrapper>
  );
}
