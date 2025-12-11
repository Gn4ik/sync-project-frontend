describe('Helper Functions', () => {
  describe('Date formatting functions', () => {
    const formatNotificationDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMinutes < 60) {
        return `${diffMinutes} мин. назад`;
      } else if (diffHours < 24) {
        return `${diffHours} ч. назад`;
      } else if (diffDays === 1) {
        return 'Вчера';
      } else if (diffDays < 7) {
        return `${diffDays} дн. назад`;
      } else {
        return date.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    };

    test('should format recent dates correctly', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      expect(formatNotificationDate(fiveMinutesAgo)).toBe('5 мин. назад');

      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      expect(formatNotificationDate(twoHoursAgo)).toBe('2 ч. назад');
    });

    test('should format older dates correctly', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      expect(formatNotificationDate(yesterday)).toBe('Вчера');

      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatNotificationDate(threeDaysAgo)).toBe('3 дн. назад');
    });
  });

  describe('URL parsing functions', () => {
    const parseNotificationLink = (link: string) => {
      const url = new URL(link, window.location.origin);
      const path = url.pathname;
      const params = new URLSearchParams(url.search);

      if (path.includes('/meetings/get_by_id/')) {
        const meetingId = params.get('id');
        return { type: 'meeting', id: meetingId ? parseInt(meetingId) : null };
      } else if (path.includes('/tasks/get_by_id/')) {
        const taskId = params.get('id');
        return { type: 'task', id: taskId ? parseInt(taskId) : null };
      }
      return { type: 'unknown', id: null };
    };

    test('should parse meeting URLs correctly', () => {
      const meetingUrl = '/meetings/get_by_id/?id=123';
      const result = parseNotificationLink(meetingUrl);
      expect(result).toEqual({ type: 'meeting', id: 123 });
    });

    test('should parse task URLs correctly', () => {
      const taskUrl = '/tasks/get_by_id/?id=456';
      const result = parseNotificationLink(taskUrl);
      expect(result).toEqual({ type: 'task', id: 456 });
    });

    test('should handle unknown URLs', () => {
      const unknownUrl = '/some/other/path';
      const result = parseNotificationLink(unknownUrl);
      expect(result).toEqual({ type: 'unknown', id: null });
    });
  });
});