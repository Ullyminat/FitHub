import multer from "multer";
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, `${import.meta.dirname}/../media`);
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    const types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (types.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Неразрершённый формат файла'), false);
    }
};
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});