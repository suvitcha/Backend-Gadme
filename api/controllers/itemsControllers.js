//createItem
export const createItem = async (req, res, next) => {
  const {
    category,
    productname,
    description,
    price,
    image,
    color = [],
    stock,
    brand,
    features = [],
    modelname,
    warrantyinfo,
    relatedproduct = [],
  } = req.body;

  //Validate data before create
  //   if (!title || !content) {
  //     const error = new Error("Title and content are required.");
  //     error.status = 400;
  //     return next(error);
  //   }

  //   try {
  //     const note = await Note.create({ title, content, tags });
  //     res.status(201).json({
  //       error: false,
  //       note: note,
  //       message: "Note created successfully",
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // };

  // //getNotes
  // export const getNotes = async (req, res, next) => {
  //   try {
  //     const notes = await Note.find().sort({ createdAt: -1 });

  //     res.status(200).json({
  //       error: false,
  //       notes, //property name ชื่อเดียวกับตัวแปรเลยเขียนแบบ shorthand แทน notes:notes,
  //       message: "All notes retrieved successfully!🌈",
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // };

  // //editNote
  // export const editNote = async (req, res, next) => {
  //   const noteId = req.params.id;

  //   const { title, content, tags } = req.body;

  //   try {
  //     const note = await Note.findOne({ _id: noteId });

  //     if (!note) {
  //       const error = new Error("Note not found!❌");
  //       error.status = 404;
  //       return next(error);
  //     }

  //     if (title) note.title = title;
  //     if (content) note.content = content;
  //     if (tags) note.tags = tags;

  //     await note.save();

  //     res.status(200).json({
  //       error: false,
  //       note,
  //       message: "Note updated successfully!⭐",
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // };

  // //deleteNote
  // export const deleteNote = async (req, res, next) => {
  //   const noteId = req.params.id;

  //   try {
  //     const note = await Note.findOne({ _id: noteId });

  //     if (!note) {
  //       const error = new Error("Note not found😥");
  //       error.status = 404;
  //       return next(error);
  //     }

  //     await Note.deleteOne({ _id: noteId });
  //     res.status(200).json({
  //       error: false,
  //       message: "Note delete successfully!🍁",
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // };
};
