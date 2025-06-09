import { GiftedChat } from "react-native-gifted-chat";

export default function MessageList({
  messages,
  onSend,
  user,
  text,
  onInputTextChanged,
  renderBubble,
  renderAvatar,
  renderInputToolbar,
  renderComposer,
  renderSend,
  renderActions,
  renderFooter,
  scrollToBottom,
  renderUsernameOnMessage,
  listViewProps,
  unread = 0,
}) {
  return (
    <GiftedChat
      messages={messages}
      onSend={onSend}
      user={user}
      text={text}
      onInputTextChanged={onInputTextChanged}
      renderBubble={(props) => renderBubble({ ...props, unread })}
      renderAvatar={null}
      //renderAvatar={renderAvatar}
      renderInputToolbar={renderInputToolbar}
      renderComposer={renderComposer}
      renderSend={renderSend}
      renderActions={renderActions}
      renderFooter={renderFooter}
      scrollToBottom={scrollToBottom}
      renderUsernameOnMessage={renderUsernameOnMessage}
      listViewProps={listViewProps}
    />
  );
}
