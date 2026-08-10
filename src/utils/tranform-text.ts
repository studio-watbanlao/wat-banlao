export const getLabelByType = (type: string) => {
  switch (type) {
    case 'dharma':
      return 'ธรรมะ';
    case 'blog':
      return 'บทความ';
    default:
      break;
  }
};
