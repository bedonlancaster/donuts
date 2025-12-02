namespace DonutAPI.Services
{
    public class AudioMetadataService : IAudioMetadataService
    {
        private readonly ILogger<AudioMetadataService> _logger;

        public AudioMetadataService(ILogger<AudioMetadataService> logger)
        {
            _logger = logger;
        }

        public TimeSpan? ExtractDuration(string filePath)
        {
            try
            {
                if (!File.Exists(filePath))
                {
                    _logger.LogWarning("Audio file not found: {FilePath}", filePath);
                    return null;
                }

                // Use TagLib to read audio file metadata
                using var file = TagLib.File.Create(filePath);

                if (file.Properties?.Duration != null)
                {
                    _logger.LogInformation("Extracted duration {Duration} from {FilePath}",
                        file.Properties.Duration, filePath);
                    return file.Properties.Duration;
                }

                _logger.LogWarning("Could not extract duration from {FilePath}", filePath);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting audio metadata from {FilePath}", filePath);
                return null;
            }
        }
    }
}
