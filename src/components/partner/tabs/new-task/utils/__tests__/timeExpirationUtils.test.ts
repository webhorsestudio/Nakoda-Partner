// Test file for time expiration utilities
import { 
  parseTimeSlot, 
  isTaskExpired, 
  getTimeUntilExpiration, 
  formatTimeRemaining,
  getCurrentTimeInMinutes 
} from '../timeExpirationUtils';

// Mock current time for testing
const mockCurrentTime = (hours: number, minutes: number) => {
  const mockDate = new Date();
  mockDate.setHours(hours, minutes, 0, 0);
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as Date);
};

describe('Time Expiration Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseTimeSlot', () => {
    test('should parse time slot codes correctly', () => {
      const result = parseTimeSlot('4972');
      expect(result).toEqual({
        startTime: '8:00AM',
        endTime: '10:00AM',
        displayText: '8:00AM - 10:00AM',
        startTimeInMinutes: 480,
        endTimeInMinutes: 600
      });
    });

    test('should parse readable time format', () => {
      const result = parseTimeSlot('2:00PM - 4:00PM');
      expect(result).toEqual({
        startTime: '2:00PM',
        endTime: '4:00PM',
        displayText: '2:00PM - 4:00PM',
        startTimeInMinutes: 840,
        endTimeInMinutes: 960
      });
    });

    test('should return null for invalid input', () => {
      expect(parseTimeSlot('')).toBeNull();
      expect(parseTimeSlot('invalid')).toBeNull();
    });
  });

  describe('isTaskExpired', () => {
    test('should return false for future timeslots', () => {
      // Mock current time as 6:00 AM
      mockCurrentTime(6, 0);
      
      const result = isTaskExpired('4972', '2024-12-19'); // 8:00AM - 10:00AM
      expect(result).toBe(false);
    });

    test('should return true for past timeslots', () => {
      // Mock current time as 9:00 AM
      mockCurrentTime(9, 0);
      
      const result = isTaskExpired('4972', '2024-12-19'); // 8:00AM - 10:00AM
      expect(result).toBe(true);
    });

    test('should return false for different service date', () => {
      // Mock current time as 9:00 AM
      mockCurrentTime(9, 0);
      
      const result = isTaskExpired('4972', '2024-12-20'); // Different date
      expect(result).toBe(false);
    });
  });

  describe('getTimeUntilExpiration', () => {
    test('should return correct minutes until expiration', () => {
      // Mock current time as 7:30 AM
      mockCurrentTime(7, 30);
      
      const result = getTimeUntilExpiration('4972', '2024-12-19'); // 8:00AM - 10:00AM
      expect(result).toBe(30); // 30 minutes until 8:00 AM
    });

    test('should return negative for expired tasks', () => {
      // Mock current time as 9:00 AM
      mockCurrentTime(9, 0);
      
      const result = getTimeUntilExpiration('4972', '2024-12-19'); // 8:00AM - 10:00AM
      expect(result).toBe(-60); // 60 minutes past 8:00 AM
    });
  });

  describe('formatTimeRemaining', () => {
    test('should format time correctly', () => {
      expect(formatTimeRemaining(30)).toBe('30m remaining');
      expect(formatTimeRemaining(90)).toBe('1h 30m remaining');
      expect(formatTimeRemaining(120)).toBe('2h remaining');
      expect(formatTimeRemaining(0)).toBe('Expired');
      expect(formatTimeRemaining(-30)).toBe('Expired');
    });
  });
});
