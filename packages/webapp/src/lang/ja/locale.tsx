// @ts-nocheck
import printValue from '../printValue';

export const locale = {
  mixed: {
    default: '${path} が正しくありません',
    required: '${path} は必須です',
    oneOf: '${path} は次のいずれかの値にしてください: ${values}',
    notOneOf: '${path} には次の値を使用できません: ${values}',
    notType: ({ path, type, value, originalValue }) => {
      let isCast = originalValue != null && originalValue !== value;
      let msg =
        `${path} は \`${type}\` 型にしてください。` +
        `実際の値: \`${printValue(value, true)}\`` +
        (isCast
          ? `（\`${printValue(originalValue, true)}\` から変換されました）。`
          : '。');

      if (value === null) {
        msg += `\n 空の値として "null" を許可する場合は、スキーマに \`.nullable()\` を指定してください`;
      }

      return msg;
    },
    defined: '${path} を指定してください',
  },
  string: {
    length: '${path} は ${length} 文字ちょうどで入力してください',
    min: '${path} は ${min} 文字以上で入力してください',
    max: '${path} は ${max} 文字以内で入力してください',
    matches: '${path} は次の形式に一致する必要があります: "${regex}"',
    email: '${path} は有効なメールアドレスを入力してください',
    url: '${path} は有効な URL を入力してください',
    trim: '${path} の前後に空白を含めないでください',
    lowercase: '${path} は小文字で入力してください',
    uppercase: '${path} は大文字で入力してください',
  },
  number: {
    min: '${path} は ${min} 以上にしてください',
    max: '${path} は ${max} 以下にしてください',
    lessThan: '${path} は ${less} より小さい値にしてください',
    moreThan: '${path} は ${more} より大きい値にしてください',
    notEqual: '${path} は ${notEqual} 以外の値にしてください',
    positive: '${path} は正の数にしてください',
    negative: '${path} は負の数にしてください',
    integer: '${path} は整数にしてください',
  },
  date: {
    min: '${path} は ${min} より後の日付にしてください',
    max: '${path} は ${max} より前の日付にしてください',
  },
  boolean: {},
  object: {
    noUnknown: '${path} にはスキーマで定義されていないキーを含められません',
  },
  array: {
    min: '${path} は ${min} 件以上にしてください',
    max: '${path} は ${max} 件以下にしてください',
  },
};
