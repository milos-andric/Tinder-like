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
      if (!tag.match(/^[A-Za-z0-9_-]+$/) || tag.length > 16) ret = false;
    });

    if (ret) next();
    else return res.status(400).json({ msg });
  };
};

export const validateIntRequired = (data, positive = false) => {
  return (req, res, next) => {
    const input = req.body[data];

    if (
      input !== null &&
      input !== '' &&
      !Array.isArray(input) &&
      !isNaN(input) &&
      input >= 0
    ) {
      if (positive && input === 0)
        return res.status(400).json({ msg: 'Invalid input' });
      next();
    } else return res.status(400).json({ msg: 'Invalid input' });
  };
};

export const validateIntOptional = (data, positive = false) => {
  return (req, res, next) => {
    const input = req.body[data];

    if (
      !input ||
      (input !== '' && !Array.isArray(input) && !isNaN(input) && input >= 0)
    ) {
      if (input && positive && input === 0)
        return res.status(400).json({ msg: 'Invalid input' });
      next();
    } else return res.status(400).json({ msg: 'Invalid input' });
  };
};

export const validateObject = obj => {
  return (req, res, next) => {
    const input = req.body[obj];
    if (typeof input === 'object' && input !== null) next();
    else return res.status(400).json({ msg: 'Invalid input' });
  };
};

export const validateIntRequiredInObject = (obj, data, positive = false) => {
  return (req, res, next) => {
    const input = req.body[obj][data];

    if (
      input !== null &&
      input !== '' &&
      !Array.isArray(input) &&
      !isNaN(input) &&
      input >= 0
    ) {
      if (positive && input === 0)
        return res.status(400).json({ msg: 'Invalid input' });
      next();
    } else return res.status(400).json({ msg: 'Invalid input' });
  };
};

export const validateIntOptionalInObject = (obj, data, positive = false) => {
  return (req, res, next) => {
    const input = req.body[obj][data];

    if (
      !input ||
      (input !== '' && !Array.isArray(input) && !isNaN(input) && input >= 0)
    ) {
      if (input && positive && input === 0)
        return res.status(400).json({ msg: 'Invalid input' });
      next();
    } else return res.status(400).json({ msg: 'Invalid input' });
  };
};

export const validateDoubleArrayIntOptionalInObject = (
  obj,
  data,
  positive = false
) => {
  return (req, res, next) => {
    const input = req.body[obj][data];

    if (
      !input ||
      (Array.isArray(input) &&
        input.length === 2 &&
        !isNaN(input[0]) &&
        input[0] !== '' &&
        input[0] >= 0 &&
        !isNaN(input[1]) &&
        input[1] !== '' &&
        input[1] >= 0)
    ) {
      if (input && positive && input[0] === 0 && input[1] === 0)
        return res.status(400).json({ msg: 'Invalid input' });
      next();
    } else return res.status(400).json({ msg: 'Invalid input' });
  };
};

export const validateString = data => {
  return (req, res, next) => {
    const input = req.body[data];
    if (typeof input === 'string') next();
    else return res.status(400).json({ msg: 'Invalid input' });
  };
};

export const validateBoolean = data => {
  return (req, res, next) => {
    const input = req.body[data];
    if (typeof input === 'boolean') next();
    else return res.status(400).json({ msg: 'Invalid input' });
  };
};

export const validateParamsIntRequired = (data, positive = false) => {
  return (req, res, next) => {
    let input = req.params[data];

    if (input !== undefined) input = Number(input);
    if (
      input !== null &&
      input !== undefined &&
      input !== '' &&
      !Array.isArray(input) &&
      !isNaN(input) &&
      input >= 0
    ) {
      if (input && positive && input === 0)
        return res.status(400).json({ msg: 'Invalid input' });
      next();
    } else return res.status(400).json({ msg: 'Invalid input' });
  };
};

export const validateParamsIntOptional = (data, positive = false) => {
  return (req, res, next) => {
    let input = req.params[data];

    if (input !== undefined) input = Number(input);
    if (
      input === null ||
      input === undefined ||
      (input !== '' && !Array.isArray(input) && !isNaN(input) && input >= 0)
    ) {
      if (input !== null && positive && input === 0)
        return res.status(400).json({ msg: 'Invalid input' });
      next();
    } else return res.status(400).json({ msg: 'Invalid input' });
  };
};
