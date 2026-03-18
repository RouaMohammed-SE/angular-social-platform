import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  GetNotificationsResponse,
  GetUnreadCountResponse,
  MarkAllAsReadResponse,
  MarkNotificationAsReadResponse,
} from '../../models/notifications-response.interface';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private readonly httpClient = inject(HttpClient);

  getNotifications(): Observable<GetNotificationsResponse> {
    return this.httpClient.get<GetNotificationsResponse>(`${environment.apiUrl}/notifications`);
  }
  getUnreadCount(): Observable<GetUnreadCountResponse> {
    return this.httpClient.get<GetUnreadCountResponse>(`${environment.apiUrl}/notifications/unread-count`);
  }
  markNotificationAsRead(notificationId: string): Observable<MarkNotificationAsReadResponse> {
    return this.httpClient.patch<MarkNotificationAsReadResponse>(
      `${environment.apiUrl}/notifications/${notificationId}/read`,
      {},
    );
  }
  markAllAsRead(): Observable<MarkAllAsReadResponse> {
    return this.httpClient.patch<MarkAllAsReadResponse>(`${environment.apiUrl}/notifications/read-all`, {});
  }
}
