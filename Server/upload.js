// FOR IMAGE UPLOAD

const fs = require('fs');
const multer = require('multer');
const path = require('path');


// Define the upload directory
const uploadDir = path.join(__dirname, 'uploads/profile_pics');

// Check if the directory exists, create if not
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profile_pics/'); // Save in an "uploads" folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

//return the error to frontend (not implemented)
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (extName && mimeType) {
            return cb(null, true);
        } else {
            return cb(new Error('Only .png, .jpg, and .jpeg format allowed!'));
        }
    }
});

module.exports = upload;
