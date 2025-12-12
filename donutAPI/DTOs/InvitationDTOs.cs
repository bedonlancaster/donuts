using DonutAPI.Models;

namespace DonutAPI.DTOs
{
    // DTO for searching users
    public class UserSearchResultDTO
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? ProfileImageUrl { get; set; }
    }

    // DTO for sending an invitation
    public class SendInvitationDTO
    {
        public int ProjectId { get; set; }
        public int InvitedUserId { get; set; }
        public string? Message { get; set; }
    }

    // DTO for invitation response (accept/decline)
    public class RespondToInvitationDTO
    {
        public int InvitationId { get; set; }
        public bool Accept { get; set; } // true = accept, false = decline
    }

    // DTO for viewing an invitation
    public class InvitationDTO
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string ProjectTitle { get; set; } = string.Empty;
        public string? ProjectArtworkUrl { get; set; }
        public int InvitedById { get; set; }
        public string InvitedByUserName { get; set; } = string.Empty;
        public string InvitedByFullName { get; set; } = string.Empty;
        public string? InvitedByProfileImageUrl { get; set; }
        public string? Message { get; set; }
        public InvitationStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? RespondedAt { get; set; }
    }

    // DTO for viewing sent invitations (from project owner's perspective)
    public class SentInvitationDTO
    {
        public int Id { get; set; }
        public int InvitedUserId { get; set; }
        public string InvitedUserName { get; set; } = string.Empty;
        public string InvitedUserFullName { get; set; } = string.Empty;
        public string? InvitedUserProfileImageUrl { get; set; }
        public string? Message { get; set; }
        public InvitationStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? RespondedAt { get; set; }
    }
}
