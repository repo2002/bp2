import { createContext, useContext, useRef, useState } from "react";

const BottomSheetContext = createContext(null);

export function BottomSheetProvider({ children }) {
  const commentSheetRef = useRef(null);
  const shareSheetRef = useRef(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const openCommentSheet = (post) => {
    setSelectedPost(post);
    commentSheetRef.current?.open();
  };

  const openShareSheet = (post) => {
    setSelectedPost(post);
    shareSheetRef.current?.open();
  };

  return (
    <BottomSheetContext.Provider
      value={{
        commentSheetRef,
        shareSheetRef,
        selectedPost,
        openCommentSheet,
        openShareSheet,
      }}
    >
      {children}
    </BottomSheetContext.Provider>
  );
}

export function useBottomSheet() {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error("useBottomSheet must be used within a BottomSheetProvider");
  }
  return context;
}
