/**
 * Extracts the first frame of a video file and returns it as a static JPEG File.
 * * @param {File} videoFile - The uploaded video file object.
 * @returns {Promise<File>} - A promise that resolves to the static image File object.
 */
export const extractFirstFrame = (videoFile) => {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.muted = true; // Prevents browser autoplay restrictions from blocking the load
        video.playsInline = true;
        video.preload = "metadata";

        const videoUrl = URL.createObjectURL(videoFile);
        video.src = videoUrl;

        // When metadata loads, seek slightly past the start. 
        // 0.1s is much safer than 0.0s, as 0.0s sometimes yields a black frame depending on the codec.
        video.addEventListener("loadedmetadata", () => {
            video.currentTime = 0.1;
        });

        // The 'seeked' event fires when the video has successfully skipped to 0.1s
        video.addEventListener("seeked", () => {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext("2d");
            // Draw the current video frame onto the canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert the canvas to a Blob, then to a File
            canvas.toBlob((blob) => {
                // Always clean up the object URL to avoid memory leaks
                URL.revokeObjectURL(videoUrl); 

                if (!blob) {
                    reject(new Error("Failed to convert canvas to blob"));
                    return;
                }

                // Create a new File object from the blob
                const originalName = videoFile.name.split('.')[0];
                const imageFile = new File([blob], `${originalName}-thumbnail.jpg`, {
                    type: "image/jpeg",
                });

                resolve(imageFile);
            }, "image/jpeg", 0.9); // 0.9 represents 90% JPEG quality
        });

        // Error handling
        video.addEventListener("error", () => {
            URL.revokeObjectURL(videoUrl);
            reject(new Error("Error loading video file for frame extraction"));
        });
    });
};