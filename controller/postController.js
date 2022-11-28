const Post = require("../model/postModel");
const mongoose = require("mongoose");

const getPosts = async (_, response) => {
  try {
    const result = await Post.aggregate([
      { $match: { isPrivate: false } },
      {
        $lookup: {
          from: "users",
          localField: "poster",
          foreignField: "_id",
          as: "poster",
        },
      },
      { $sort: { created: 1 } },
      {
        $unwind: "$poster",
      },
    ]);
    response.status(200).send({ error: false, result });
  } catch (error) {
    console.log("error", error);
    response.send({ error: true });
  }
};

const getUserPosts = async (request, response) => {
  const { id } = request.user;

  try {
    const posts = await Post.aggregate([
      { $match: { poster: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "users",
          localField: "poster",
          foreignField: "_id",
          as: "poster",
        },
      },
      { $sort: { created: 1 } },
      {
        $unwind: "$poster",
      },
    ]);
    const result = posts.sort((a, b) => b.created - a.created);

    response.status(200).send({ error: false, result });
  } catch (err) {
    response.send({ error: true, err });
  }
};

const newPost = async (request, response) => {
  const { context, isPrivate } = request.body;
  const { id } = request.user;

  const newPost = new Post({
    poster: id,
    context: context,
    isPrivate: isPrivate,
    created: new Date(),
  });

  newPost.save((err, result) => {
    if (err) {
      response.send({ message: "post add failed!" });
    } else {
      response.send({ message: "Successfully added!" });
    }
  });
};

const deletPost = async (request, response) => {
  const _id = request.params.id;
  const { id } = request.user;
  const post = await Post.findOne({ poster: id, _id: _id });
  if (post) {
    const result = await Post.deleteOne({ _id: _id });

    if (result.deletedCount === 1) {
      response.send({ message: "Successfully deleted", error: false });
    } else {
      response.send({ message: "delete failed", error: true });
    }
  } else {
    response.send({ message: "You aren't a owner of this post", error: true });
  }
};

const editPost = async (request, response) => {
  const { _id, context, isPrivate } = request.body;
  const { id } = request.user;
  const post = await Post.findOne({ poster: id, _id: _id });
  if (post) {
    const newPost = new Post({
      _id: _id,
      poster: id,
      context,
      isPrivate,
      created: new Date(),
    });

    try {
      await Post.updateOne({ _id: _id }, newPost);
      response.send({
        error: false,
        newPost,
        message: "Successfully edited the post",
      });
    } catch (err) {
      console.log("Error", err);
      response.send({ error: true });
    }
  } else {
    response.send({ message: "You aren't a owner of this post", error: true });
  }
};

module.exports = { getPosts, newPost, deletPost, editPost, getUserPosts };
