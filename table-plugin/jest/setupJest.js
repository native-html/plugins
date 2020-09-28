// eslint-disable-next-line no-undef
expect.extend({
  toBeValidHTML(validation, strict) {
    if (!Array.isArray(validation.messages)) {
      throw new Error(
        'You must provide the object returned by validate-html exported function'
      );
    }
    const errors = validation.messages.filter(
      (m) => m.type === 'error' || (strict && m.subType === 'warning')
    );
    const pass = errors.length === 0;
    const feedbacks = errors.reduce(
      (prev, message) => `${prev}\nL${message.lastLine}: ${message.message}`,
      ''
    );
    return {
      pass,
      message: () =>
        pass
          ? 'HTML should not be W3C compliant'
          : 'HTML should be W3C compliant' + feedbacks
    };
  }
});
