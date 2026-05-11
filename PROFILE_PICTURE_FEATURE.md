# Profile Picture Upload Feature

## Overview
Added functionality for users to upload, view, and delete their profile pictures in the Profile section.

## Implementation Details

### Backend Changes

#### 1. **User Model** (`backend/models/User.js`)
- Added `profilePicture` field (String, default: null) to store the path to the uploaded image

#### 2. **Upload Middleware** (`backend/middleware/upload.js`)
- Created multer configuration for handling file uploads
- Set up disk storage in `backend/uploads/profiles/` directory
- File naming: `profile-{userId}-{timestamp}.{ext}`
- Validation: Only image files (JPEG, JPG, PNG, GIF, WEBP)
- File size limit: 5MB maximum

#### 3. **Auth Controller** (`backend/controllers/authController.js`)
- Added `uploadProfilePicture()` - handles profile picture uploads
- Added `deleteProfilePicture()` - handles profile picture deletion
- Updated existing auth responses to include `profilePicture` field
- Automatic cleanup of old profile pictures when uploading new ones

#### 4. **Routes** (`backend/routes/authRoutes.js`)
- POST `/api/auth/profile/picture` - upload profile picture
- DELETE `/api/auth/profile/picture` - delete profile picture

#### 5. **Server Configuration** (`backend/server.js`)
- Added static file serving for `/uploads` directory

### Frontend Changes

#### 1. **API Utility** (`frontend/utils/api.js`)
- Added `uploadProfilePicture(file)` - uploads profile picture with FormData
- Added `deleteProfilePicture()` - deletes current profile picture
- Automatic localStorage synchronization for profile picture URL

#### 2. **Profile Page** (`frontend/pages/profile.js`)
- Added interactive avatar with hover overlay
- Upload button with file input (hidden)
- Delete button (shown only when profile picture exists)
- Loading spinner during upload/delete operations
- File validation (type and size)
- Success/error messages
- Automatic UI update after upload/delete

#### 3. **Styling** (`frontend/styles/Profile.module.css`)
- `.avatarImage` - displays uploaded profile picture
- `.avatarOverlay` - hover overlay with edit/delete buttons
- `.avatarEditBtn` - styled upload button
- `.avatarDeleteBtn` - styled delete button
- `.uploadingSpinner` - loading animation
- Smooth transitions and hover effects

#### 4. **Translations** (`frontend/utils/translations.js`)
Added translation keys for all 5 languages (English, Hindi, Spanish, French, German):
- `profile.uploadPhoto`
- `profile.deletePhoto`
- `profile.photoTooLarge`
- `profile.invalidPhotoType`
- `profile.photoUploadSuccess`
- `profile.photoUploadError`
- `profile.confirmDeletePhoto`
- `profile.photoDeleteSuccess`
- `profile.photoDeleteError`

## User Experience

### Upload Flow
1. Navigate to Profile page
2. Hover over avatar
3. Click camera/upload icon
4. Select image file (JPEG, PNG, GIF, WEBP, max 5MB)
5. Image uploads automatically
6. Success message appears
7. Avatar updates immediately

### Delete Flow
1. Hover over avatar (with existing profile picture)
2. Click delete/trash icon
3. Confirm deletion in popup
4. Image deletes from server
5. Avatar reverts to initials
6. Success message appears

## Technical Features

- **Automatic File Cleanup**: Old profile pictures are deleted when new ones are uploaded
- **Validation**: Client-side and server-side validation for file type and size
- **Security**: Protected routes require authentication
- **Responsive Design**: Works seamlessly on all screen sizes
- **Multi-language Support**: Fully translated interface
- **Error Handling**: Comprehensive error messages for all failure scenarios
- **Loading States**: Visual feedback during upload/delete operations

## File Structure
```
backend/
├── middleware/
│   └── upload.js (new)
├── uploads/
│   └── profiles/ (new, auto-created)
├── models/
│   └── User.js (updated)
├── controllers/
│   └── authController.js (updated)
├── routes/
│   └── authRoutes.js (updated)
└── server.js (updated)

frontend/
├── pages/
│   └── profile.js (updated)
├── styles/
│   └── Profile.module.css (updated)
└── utils/
    ├── api.js (updated)
    └── translations.js (updated)
```

## Testing Checklist

- [ ] Upload a profile picture (JPEG)
- [ ] Upload a profile picture (PNG)
- [ ] Try uploading file > 5MB (should fail with error)
- [ ] Try uploading non-image file (should fail with error)
- [ ] Delete existing profile picture
- [ ] Upload new picture after deletion
- [ ] Check picture persists after page reload
- [ ] Test in different languages
- [ ] Test on mobile/tablet/desktop
- [ ] Verify old pictures are deleted from server

## API Endpoints

### Upload Profile Picture
```http
POST /api/auth/profile/picture
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body: FormData with 'profilePicture' field containing the image file

Response:
{
  "_id": "userId",
  "name": "User Name",
  "email": "user@email.com",
  "profilePicture": "/uploads/profiles/profile-userId-timestamp.jpg",
  "message": "Profile picture uploaded successfully"
}
```

### Delete Profile Picture
```http
DELETE /api/auth/profile/picture
Authorization: Bearer {token}

Response:
{
  "_id": "userId",
  "name": "User Name",
  "email": "user@email.com",
  "profilePicture": null,
  "message": "Profile picture deleted successfully"
}
```

## Dependencies Added
- `multer` (^1.4.5-lts.1) - File upload middleware for Node.js
