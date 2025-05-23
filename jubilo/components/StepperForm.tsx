import React from "react";
import { View, StyleSheet, SafeAreaView } from "react-native";
import ThemeText from "./ThemeText";

import { useTheme } from "@/hooks/useTheme";
import { useForm } from "@/contexts/FormContext";

interface Step {
  title: string;
  description?: string;
  component: React.ComponentType<any>;
}

interface StepperFormProps {
  steps: Step[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  formData: any;
  setFormData: (data: any) => void;
  onStepComplete?: (data: any) => void;
}

export default function StepperForm({
  steps,
  currentStep,
  setCurrentStep,
  onStepComplete,
}: Omit<StepperFormProps, "formData" | "setFormData">) {
  const { formData, setFormData } = useForm();
  const step = steps[currentStep];
  const CurrentStepComponent = step.component;
  const theme = useTheme();

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: "column",
          width: "100%",
          paddingBottom: 16,
          marginBottom: 16,
          borderBottomWidth: 1,
          paddingHorizontal: 20,
          borderColor: theme.colors.greyLight,
        }}
      >
        <ThemeText style={{ fontSize: 32, fontWeight: "bold" }}>
          {step.title}
        </ThemeText>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          {step.description && <ThemeText>{step.description}</ThemeText>}
          <ThemeText color={theme.colors.greyDark} style={{ fontSize: 22 }}>
            {currentStep + 1}/{steps.length}
          </ThemeText>
        </View>
      </View>

      <View style={styles.content}>
        <CurrentStepComponent
          data={formData}
          onNext={(newData: any) => {
            setFormData({ ...formData, ...newData });
            if (onStepComplete) {
              onStepComplete(newData);
            } else {
              setCurrentStep(currentStep + 1);
            }
          }}
          prev={() => setCurrentStep(currentStep - 1)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
