const { Space } = require("../models/space");

exports.getSpaceById = (req, res, next, id) => {
  Space.findById(id).exec((err, space) => {
    if (err) {
      return res.status(500).json({
        err: "Error in searching DB",
      });
    }
    if (!space) {
      return res.status(404).json({
        msg: "Space not found",
      });
    }

    req.space = space;
    next();
  });
};

exports.getSpace = (req, res) => {
  res.json(req.space);
};

exports.getAllSpaces = (req, res) => {
  Space.find().exec((err, spaces) => {
    if (err) {
      return res.status(500).json({
        err: "Problem in fetching all the spaces",
      });
    }
    res.json(spaces);
  });
};

exports.createSpace = (req, res) => {
  let space = new Space(req.body);
  space.save((err, space) => {
    if (err) {
      return res.status(500).json({
        err: "Error in saving space to the DB",
      });
    }
    res.json(space);
  });
};
exports.updateSpace = (req, res) => {
  let space = req.space;
  space.name = req.body.name;
  space.description = req.body.description;
  if (req.body.users) {
    space.users = req.body.users;
  }
  space.save((err, space) => {
    if (err) {
      return res.status(500).json({
        err: "Error in updating space in the DB",
      });
    }
    res.json(space);
  });
};
exports.removeSpace = (req, res) => {
  let space = req.space;
  space.remove((err, space) => {
    if (err) {
      return res.status(500).json({
        err: "Error in removing space from the DB",
      });
    }
    res.json(space);
  });
};
