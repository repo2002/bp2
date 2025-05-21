export interface Theme {
  colors: {
    light: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
      link: string;
      invertedText: string;
      invertedBackground: string;
      error: string;
      green: string;
      grey: string;
      greyLight: string;
      greyDark: string;
      greyDarkest: string;
      greyLightest: string;
      
    };
    dark: {
      primary: string;
      secondary: string;
      background: string;
      text: string;
      link: string;
      invertedText: string;
      invertedBackground: string;
      error: string;
      green: string;
      grey: string;
      greyLight: string;
      greyDark: string;
      greyDarkest: string;
      greyLightest: string;
  };
}
};

export const theme: Theme = {
  colors: {
    light: {
      primary: '#0A84FF',
      secondary: '#5856D6',
      background: "#f8f8f8",
      link: "#007AFF",
      invertedText: "#ffffff",
      invertedBackground: "#000000",
      green: "#00FF00",
      error: "#FF0000",
      text: "#000000",
      grey: "#808080",
      greyLight: "#D3D3D3",
      greyDark: "#A9A9A9",
      greyDarkest: "#696969",
      greyLightest: "#F5F5F5",
    },
    dark: {
      primary: "#0A84FF",
      secondary: "#5E5CE6",
      background: "#000219",
      invertedText: "#000000",
      invertedBackground: "#FFFFFF",
      green: "#00FF00",
      error: "#FF0000",
      text: "#FFFFFF",
      link: "#0A84FF",
      grey: "#B0B0B0",
      greyLight: "#C0C0C0",
      greyDark: "#999999",
      greyDarkest: "#7A7A7A",
      greyLightest: "#E0E0E0",
    },
  },
}; 