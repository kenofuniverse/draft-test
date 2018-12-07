export const TAG = 1;
export const PERSON = 2;
export const RELATIONS = 3;
export const TAG_TRIGGER = '#';
export const PERSON_TRIGGER = '@';
export const RELATIONS_TRIGGER = '<>';

export const TAG_REG_EX = /^#/;
export const PERSON_REG_EX = /^@/;
export const RELATIONS_REG_EX = /^<>/;

export const triggerByType = (type) => {
  switch(type) {
    case TAG:
      return TAG_TRIGGER;
    case PERSON:
      return PERSON_TRIGGER;
    case RELATIONS:
      return RELATIONS_TRIGGER;
    default:
      return TAG_TRIGGER;
  }
};

export const regExByType = (type) => {
  switch(type) {
    case TAG:
      return TAG_REG_EX;
    case PERSON:
      return PERSON_REG_EX;
    case RELATIONS:
      return RELATIONS_REG_EX;
    default:
      return TAG_REG_EX;
  }
};
