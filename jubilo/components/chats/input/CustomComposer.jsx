import { Composer } from "react-native-gifted-chat";

const CustomComposer = (props) => {
  const { theme } = props;
  return (
    <Composer
      {...props}
      textInputStyle={{
        color: theme.colors.text,
        padding: 12,
      }}
      textInputProps={{
        //placeholderTextColor: "black",
        multiline: true,
        maxLength: 1000,
        autoFocus: false,
        style: {
          flex: 1,
          padding: 8,
          marginHorizontal: 8,
          color: theme.colors.text,
          //backgroundColor: theme.colors.greyLight,
          borderRadius: 100,
        },
      }}
    />
  );
};

export default CustomComposer;
