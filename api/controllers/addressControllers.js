import { Address } from "../../models/Address.js";

// getAddress
export const getAddress = async (req, res, next) => {
  // comment ออก หากจะ test โดยไม่ต้องใช้ token
  if (!req.user || !req.user.id) {
    const error = new Error("Unauthorized: No user found in request object!");
    error.status = 401;
    return next(error);
  }

  // mock userId ถ้าไม่มี token สำหรับ test โดยไม่ต้องใช้ token
  // const userId = req.user?.id || req.user?._id || "TEST_USER";

  try {
    const address = await Address.find({ userId: req.user._id }); // ไม่ได้ .sort({}) // หากจะ test โดยไม่ต้องใช้ token ให้ลบ : req.user._id ออก
    res.status(200).json({
      error: false,
      address,
      message: "Address retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

// createAddress
export const createAddress = async (req, res, next) => {
  // comment ออก หากจะ test โดยไม่ต้องใช้ token
  const userId = req.user._id;

  // mock userId ถ้าไม่มี token สำหรับ test โดยไม่ต้องใช้ token
  // const userId = req.user?.id || req.user?._id || "TEST_USER";

  const {
    firstname,
    lastname,
    phonenumber,
    roomnumber,
    floor,
    buildingname,
    housenumber,
    villagenumber,
    villagename,
    alley,
    road,
    subdistrict,
    district,
    province,
    postalcode = [],
  } = req.body;

  if (
    !firstname ||
    !lastname ||
    !phonenumber ||
    !road ||
    !subdistrict ||
    !district ||
    !province ||
    !postalcode
  ) {
    const error = new Error("Your shipping details are required!");
    error.status = 400;
    return next(error);
  }

  try {
    const address = await Address.create({
      userId,
      firstname,
      lastname,
      phonenumber,
      roomnumber,
      floor,
      buildingname,
      housenumber,
      villagenumber,
      villagename,
      alley,
      road,
      subdistrict,
      district,
      province,
      postalcode,
    });
    res.status(201).json({
      error: false,
      address,
      message: "Address created successfully",
    });
  } catch (error) {
    next(error);
  }
};

// updateAddress
export const updateAddress = async (req, res, next) => {
  // comment ออก หากจะ test โดยไม่ต้องใช้ token
  const userId = req.user._id;
  if (!req.user || !req.user._id) {
    const error = new Error("Unauthorized: No user found in request object!");
    error.status = 401;
    return next(error);
  }

  // mock userId ถ้าไม่มี token สำหรับ test โดยไม่ต้องใช้ token
  // const userId = req.user?.id || req.user?._id || "TEST_USER";

  const addressId = req.params.id;

  const {
    firstname,
    lastname,
    phonenumber,
    roomnumber,
    floor,
    buildingname,
    housenumber,
    villagenumber,
    villagename,
    alley,
    road,
    subdistrict,
    district,
    province,
    postalcode,
  } = req.body;

  try {
    const address = await Address.findOne({
      _id: addressId,
      userId: req.user._id, // หากจะ test โดยไม่ต้องใช้ token ให้เปลี่ยน userId: req.user._id, เป็น userId: userId, เพื่อให้ไปใช้ mock userId แทน
    });

    if (!address) {
      const error = new Error("Address not found!");
      error.status = 404;
      return next(error);
    }

    if (firstname) address.firstname = firstname;
    if (lastname) address.lastname = lastname;
    if (phonenumber) address.phonenumber = phonenumber;
    if (roomnumber) address.roomnumber = roomnumber;
    if (floor) address.floor = floor;
    if (buildingname) address.buildingname = buildingname;
    if (housenumber) address.housenumber = housenumber;
    if (villagenumber) address.villagenumber = villagenumber;
    if (villagename) address.villagename = villagename;
    if (alley) address.alley = alley;
    if (road) address.road = road;
    if (subdistrict) address.subdistrict = subdistrict;
    if (district) address.district = district;
    if (province) address.province = province;
    if (postalcode) address.postalcode = postalcode;

    await address.save();
    res.status(201).json({
      error: false,
      address,
      message: "Address updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// deleteAddress
export const deleteAddress = async (req, res, next) => {
  // comment ออก หากจะ test โดยไม่ต้องใช้ token
  const userId = req.user._id;
  if (!req.user || !req.user._id) {
    const error = new Error("Unauthorized: No user found in request object!");
    error.status = 401;
    return next(error);
  }

  // mock userId ถ้าไม่มี token สำหรับ test โดยไม่ต้องใช้ token
  // const userId = req.user?.id || req.user?._id || "TEST_USER";

  const addressId = req.params.id;

  try {
    const address = await Address.findOne({
      _id: addressId,
      userId: req.user._id, // หากจะ test โดยไม่ต้องใช้ token ให้เปลี่ยน userId: req.user._id, เป็น userId: userId, เพื่อให้ไปใช้ mock userId แทน
    });

    if (!address) {
      const error = new Error("Address not found!");
      error.status = 404;
      return next(error);
    }

    await Address.deleteOne({ _id: addressId });
    res.status(200).json({
      error: false,
      address,
      message: "Address deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
