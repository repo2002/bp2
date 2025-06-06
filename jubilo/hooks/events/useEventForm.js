import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

const DRAFT_KEY_PREFIX = "event_draft_";
const DRAFT_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

export function useEventForm(eventId = null) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: null,
    end_time: null,
    location: "",
    max_participants: null,
    is_private: false,
    questions: [],
    images: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const { user } = useAuth();

  const loadDraft = async () => {
    try {
      const draftKey = `${DRAFT_KEY_PREFIX}${eventId || "new"}`;
      const draft = await AsyncStorage.getItem(draftKey);
      if (draft) {
        const { data, timestamp } = JSON.parse(draft);
        if (Date.now() - timestamp < DRAFT_EXPIRY) {
          setFormData(data);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error("Error loading draft:", err);
      return false;
    }
  };

  const saveDraft = async () => {
    try {
      const draftKey = `${DRAFT_KEY_PREFIX}${eventId || "new"}`;
      await AsyncStorage.setItem(
        draftKey,
        JSON.stringify({
          data: formData,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.error("Error saving draft:", err);
    }
  };

  const clearDraft = async () => {
    try {
      const draftKey = `${DRAFT_KEY_PREFIX}${eventId || "new"}`;
      await AsyncStorage.removeItem(draftKey);
    } catch (err) {
      console.error("Error clearing draft:", err);
    }
  };

  useEffect(() => {
    if (eventId) {
      loadEventData();
    } else {
      loadDraft();
    }
  }, [eventId]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("events")
        .select(
          `
          *,
          questions:event_questions(*),
          images:event_images(*)
        `
        )
        .eq("id", eventId)
        .single();

      if (err) throw err;

      setFormData({
        title: data.title,
        description: data.description,
        start_time: data.start_time,
        end_time: data.end_time,
        location: data.location,
        max_participants: data.max_participants,
        is_private: data.is_private,
        questions: data.questions || [],
        images: data.images || [],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.title?.trim()) {
      errors.title = "Title is required";
    }

    if (!formData.description?.trim()) {
      errors.description = "Description is required";
    }

    if (!formData.start_time) {
      errors.start_time = "Start time is required";
    }

    if (!formData.end_time) {
      errors.end_time = "End time is required";
    } else if (
      formData.start_time &&
      new Date(formData.end_time) <= new Date(formData.start_time)
    ) {
      errors.end_time = "End time must be after start time";
    }

    if (!formData.location?.trim()) {
      errors.location = "Location is required";
    }

    if (formData.max_participants !== null && formData.max_participants < 1) {
      errors.max_participants = "Maximum participants must be at least 1";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateFormData = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    saveDraft();
  };

  const addQuestion = (question) => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, { ...question, id: Date.now() }],
    }));
    saveDraft();
  };

  const updateQuestion = (questionId, updates) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    }));
    saveDraft();
  };

  const removeQuestion = (questionId) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }));
    saveDraft();
  };

  const addImage = async (imageUri) => {
    try {
      const fileExt = imageUri.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `event-images/${eventId || "temp"}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("events")
        .upload(filePath, {
          uri: imageUri,
          type: `image/${fileExt}`,
          name: fileName,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("events").getPublicUrl(filePath);

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, { url: publicUrl, path: filePath }],
      }));
      saveDraft();
    } catch (err) {
      setError(err.message);
    }
  };

  const removeImage = async (imagePath) => {
    try {
      if (eventId) {
        await supabase.storage.from("events").remove([imagePath]);
      }

      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img.path !== imagePath),
      }));
      saveDraft();
    } catch (err) {
      setError(err.message);
    }
  };

  const submitForm = async () => {
    try {
      if (!validateForm()) return;

      setLoading(true);
      setError(null);

      const eventData = {
        ...formData,
        creator_id: user.id,
      };

      let result;
      if (eventId) {
        const { data, error: err } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", eventId)
          .select()
          .single();

        if (err) throw err;
        result = data;
      } else {
        const { data, error: err } = await supabase
          .from("events")
          .insert(eventData)
          .select()
          .single();

        if (err) throw err;
        result = data;
      }

      // Handle questions
      if (eventId) {
        await supabase.from("event_questions").delete().eq("event_id", eventId);
      }

      if (formData.questions.length > 0) {
        const questions = formData.questions.map((q) => ({
          ...q,
          event_id: result.id,
        }));

        const { error: err } = await supabase
          .from("event_questions")
          .insert(questions);

        if (err) throw err;
      }

      // Handle images
      if (eventId) {
        await supabase.from("event_images").delete().eq("event_id", eventId);
      }

      if (formData.images.length > 0) {
        const images = formData.images.map((img) => ({
          url: img.url,
          path: img.path,
          event_id: result.id,
        }));

        const { error: err } = await supabase
          .from("event_images")
          .insert(images);

        if (err) throw err;
      }

      await clearDraft();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    validationErrors,
    updateFormData,
    addQuestion,
    updateQuestion,
    removeQuestion,
    addImage,
    removeImage,
    submitForm,
    clearDraft,
  };
}
