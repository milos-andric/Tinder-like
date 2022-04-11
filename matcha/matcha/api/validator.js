export const validateInput = (data, msg) => {
  return (req, res, next) => {
    const input = (req.body[data] || '').trim();
    if (!(input.length >= 3 && input.length <= 16))
      return res.status(400).json({ msg });
    if (
      !input.match(
        /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u
      )
    )
      return res.status(400).json({ msg: 'Invalid username' });

    next();
  };
};

export const validateUsername = (data, msg) => {
  return (req, res, next) => {
    const input = (req.body[data] || '').trim();
    if (!(input.length >= 3 && input.length <= 16))
      return res.status(400).json({ msg });
    if (!input.match(/^[A-Za-z][A-Za-z0-9_]+$/))
      return res.status(400).json({ msg: 'Invalid username' });

    next();
  };
};

export const validateEmail = data => {
  return (req, res, next) => {
    const input = req.body[data].trim();

    if (
      input.match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    )
      next();
    else return res.status(400).json({ msg: 'Invalid mail address' });
  };
};

export const validatePassword = (data, msg) => {
  return (req, res, next) => {
    const input = req.body[data];

    if (
      input.length >= 8 &&
      input.match(/[A-Z]/) &&
      input.match(/[a-z]/) &&
      input.match(/[0-9]/)
    )
      next();
    else return res.status(400).json({ msg });
  };
};

export const validateInt = (data, min, max) => {
  return (req, res, next) => {
    const input = req.body[data];

    if (input >= min && input <= max) next();
    else return res.status(400).json({ msg: 'Invalid input' });
  };
};

export const validateText = (data, max, msg) => {
  return (req, res, next) => {
    const input = (req.body[data] || '').trim();

    if (input.length <= max) next();
    else return res.status(400).json({ msg });
  };
};

export const validateAge = (data, msg) => {
  return (req, res, next) => {
    const input = req.body[data];

    const maxDate = new Date();
    maxDate.setYear(maxDate.getFullYear() - 18);

    const birthDate = new Date(input);

    if (maxDate - birthDate > 0) next();
    else return res.status(400).json({ msg });
  };
};

export const validateTags = (data, msg) => {
  return (req, res, next) => {
    const tags = req.body[data];

    let ret = true;
    tags.forEach(tag => {
      if (!tag.match(/^[A-Za-z0-9_]+$/) || tag.length > 16) ret = false;
    });

    if (ret) next();
    else return res.status(400).json({ msg });
  };
};
