import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import StepperForm from "@/components/StepperForm";
import UserDetails from "@/components/register/UserDetails";
import EmailVerification from "@/components/register/EmailVerification";
import ThemeText from "@/components/ThemeText";
import { Link, useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { FormProvider } from "@/contexts/FormContext";
import ProfileSetupModal from "@/components/ProfileSetupModal";

export default function Register() {
  const theme = useTheme();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const steps = [
    {
      title: "Basic Info",
      description: "Your information is safe with us. 😊",
      component: UserDetails,
    },
    {
      title: "Verify Email",
      description: "We sent a code to your email. 📧",
      component: EmailVerification,
    },
  ];

  const handleStepComplete = (data: any) => {
    if (data?.showProfileSetup) {
      setShowProfileSetup(true);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleComplete = () => {
    setShowProfileSetup(false);
    router.replace("/(guarded)/(tabs)");
  };

  return (
    <FormProvider>
      <View style={styles.container}>
        <StepperForm
          steps={steps}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onStepComplete={handleStepComplete}
        />
        <ThemeText style={{ textAlign: "center", marginBottom: 32 }}>
          Already have an account?
          <Link href="/login" asChild>
            <ThemeText
              color={theme.colors.primary}
              style={{ fontWeight: "bold" }}
            >
              Login
            </ThemeText>
          </Link>
        </ThemeText>

        <ProfileSetupModal
          visible={showProfileSetup}
          onClose={() => setShowProfileSetup(false)}
          onComplete={handleComplete}
        />
      </View>
    </FormProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
