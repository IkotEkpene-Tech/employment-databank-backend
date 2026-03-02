

export enum UserResponses {
    NOT_FOUND = "User not found",
    PASSWORD_RESET_OTP = "Password reset OTP has been sent to your email",
    INVALID_OTP = "Invalid OTP. Please try again or request a new OTP",
    EXPIRED_OTP = "OTP expired. Please request a new OTP",
    PASSWORD_RESET_SUCCESSFUL = "Password reset successful",
    SELECT_A_FIELD = "At least one field must be selected for update",
    SELECT_DIFFERENT_USERNAME = "This is your current username, please choose another username if you wish to change it",
    UNAVAILABLE_USER_NAME = "Username unavailable, please choose another username",
    AVAILABLE_USERNAME = "Username Available",
    INVALID_PHONE = "Invalid phone number",
    SUCCESSFULY_PROFILE_CREATION = "Profile updated successfully",
    SELECT_AN_IMAGE = "Select an Image",
    USER_IMAGE_UPDATE_SUCCESS = "User image changed successfully",
    EVENTYZZE_ID_GENERATE_FAILURE = "Failed to generate unique identifier, please try again",
    UNABLE_TO_FETCH_EVENTS = "Unable to fetch Events",
    LIVE_EVENTS_FETCHED_SUCCESSFULLY = "Live Events fetched successfully",
    NEW_EVENTS_FETCHED_SUCCESSFULLY = "New Events fetched successfully",
    EVENTS_FETCHED_SUCCESSFULLY = "Events fetched successfully",
    RECORDED_EVENTS_FETCHED_SUCCESSFULLY = "Recorded Events fetched successfully",
    TRENDING_EVENTS_FETCHED_SUCCESSFULLY = "Trending Events fetched successfully",
}