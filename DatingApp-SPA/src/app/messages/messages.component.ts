import { Component, OnInit } from '@angular/core';
import { Message } from '../_models/message';
import { Pagination, PaginatedResult } from '../_models/pagination';
import { AuthService } from '../_services/auth.service';
import { UserService } from '../_services/user.service';
import { ActivatedRoute } from '@angular/router';
import { AlertifyService } from '../_services/alertify.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  messages: Message[];
  pagination: Pagination;
  messageContainer = 'Unread';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private route: ActivatedRoute,
    private alertify: AlertifyService
  ) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      const paginatedResult: PaginatedResult<Message[]> = data.messages;
      this.messages = paginatedResult.result;
      this.pagination = paginatedResult.pagination;
    });
  }

  loadMessages() {
    this.userService
      .getMessages(
        this.authService.currentUser.id,
        this.pagination.currentPage,
        this.pagination.itemsPerPage,
        this.messageContainer
      )
      .subscribe(
        (res: PaginatedResult<Message[]>) => {
          this.messages = res.result;
          this.pagination = res.pagination;
        },
        error => {
          this.alertify.error(error);
        }
      );
  }

  pageChanged(event: any): void {
    this.pagination.currentPage = event.page;
    this.loadMessages();
  }

  deleteMessage(id: number) {
    this.alertify.confirm('Are you sure you want to delete this message', () => {
      this.userService
        .deleteMessage(this.authService.currentUser.id, id)
        .subscribe(
          () => {
            this.messages.splice(
              this.messages.findIndex(m => m.id === id),
              1
            );
            this.alertify.success('Message has been deleted')
          },
          error => {
            this.alertify.error('Failed to delete the message');
          }
        );
    });
  }
}
