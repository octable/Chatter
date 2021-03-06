const JWT = require("jsonwebtoken");
const User = require("../models/user");

signToken = user => {
  return JWT.sign(
    {
      sub: user,
      iat: Date.now()
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

module.exports = {
  signUp: async (req, res, next) => {
    const { email, password, fullname } = req.value.body;
    console.log("REQ VALUE", req.value.body);
    const exist = await User.findOne({ "local.email": email });
    if (exist) {
      return res.status(403).send({ error: "Email is already exist" });
    }
    const newUser = new User({
      method: "local",
      local: {
        fullname: fullname,
        email: email,
        password: password,
        level: "customer",
        verified: "yes",
        status: "on"
      }
    });
    await newUser.save();
    const token = signToken(newUser);

    res.status(200).json({ token });
  },
  updateDataOauth: async (req, res, next) => {
    const { fullname, id, method, status } = req.value.body;

    if (method === "google") {
      try {
        const updateUser = await User.findOneAndUpdate(
          { "google.id": id },
          { "google.fullname": fullname, "google.status": status },
          { new: true }
        );
        const token = signToken(updateUser);
        res.status(200).json({ token });
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const updateUser = await User.findOneAndUpdate(
          { "facebook.id": id },
          { "facebook.fullname": fullname, "facebook.status": status },
          { new: true }
        );
        const token = signToken(updateUser);
        res.status(200).json({ token });
      } catch (error) {
        console.log(error);
      }
    }
  },
  signIn: async (req, res, next) => {
    const token = signToken(req.user);
    res.status(200).json({ token });
    console.log("Logged in");
  },
  googleOAuth: async (req, res, next) => {
    const token = signToken(req.user);
    res.status(200).json({ token });
  },
  facebookOAuth: async (req, res, next) => {
    console.log(req.authInfo.message);
    const token = signToken(req.user);
    res.status(200).json({ token });
  },
  getFriend: async (req, res, next) => {
    var name = req.body.fullname;
    var user_id = req.body.user_id;
    var criteria = {
      $or: [
        { "local.fullname": { $regex: ".*" + name + ".*", $options: "i" } },
        { "facebook.fullname": { $regex: ".*" + name + ".*", $options: "i" } },
        { "google.fullname": { $regex: ".*" + name + ".*", $options: "i" } }
      ]
    };
    const query = User.find(criteria).limit(20);
    const data = await query
      .where("_id")
      .ne(user_id)
      .exec();
    res.status(200).json({ data, message: "SECRET" });
  }
};
