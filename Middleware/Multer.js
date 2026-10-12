import multer from 'multer';

// Use memory storage to process file before uploading to Cloudinary
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

export const upload = multer({
    storage: storage,
    limits: { 
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 5 // max 5 files in batch
    },
    fileFilter: (req, file, cb) => {
        const originalName = (file.originalname || "").toLowerCase();
        
        // Double-extension or executable pattern check
        if (/\.(exe|bat|cmd|sh|php|pl|py|js|jar|vbs|msi|dll)(\.|$)/i.test(originalName)) {
            return cb(new Error('Invalid file type: executable or dangerous file names are forbidden.'));
        }

        if (ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG, and WEBP images are permitted.'));
        }
    }
});

/**
 * Validates that uploaded file buffers actually contain valid image magic numbers
 * and are not disguised executables (e.g. malicious.exe renamed to test.jpg)
 */
export const validateUploadedImage = (req, res, next) => {
    const files = req.files 
        ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) 
        : (req.file ? [req.file] : []);

    for (const f of files) {
        if (!f.buffer || f.buffer.length < 4) {
            return res.status(400).json({
                success: false,
                message: "Invalid file: empty or corrupted image file."
            });
        }

        const buf = f.buffer;
        // Check Windows PE header (MZ = 0x4D, 0x5A) or Unix ELF
        if ((buf[0] === 0x4d && buf[1] === 0x5a) || (buf[0] === 0x7f && buf[1] === 0x45 && buf[2] === 0x4c && buf[3] === 0x46)) {
            return res.status(400).json({
                success: false,
                message: "Security violation: Executable binary detected masquerading as an image."
            });
        }

        const isJpeg = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
        const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
        const isWebp = buf.length >= 12 &&
            buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
            buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50;

        if (!isJpeg && !isPng && !isWebp) {
            return res.status(400).json({
                success: false,
                message: "Invalid file signature: Content does not match valid JPEG, PNG, or WEBP image format."
            });
        }
    }
    next();
};

export default upload;

