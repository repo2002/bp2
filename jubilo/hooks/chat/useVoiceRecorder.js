import { AudioModule, RecordingPresets, useAudioRecorder } from "expo-audio";
import { useEffect, useState } from "react";

export default function useVoiceRecorder() {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        alert("Permission to access microphone was denied");
      }
    })();
  }, []);

  const startRecording = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    await audioRecorder.stop();
    setIsRecording(false);
    return audioRecorder.uri; // This is the file URI
  };

  const resetRecording = () => {
    // This will clear the URI and reset the recorder state
    audioRecorder.reset();
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    audioUri: audioRecorder.uri,
    resetRecording,
  };
}
