'use strict';

import { Component, OnInit } from '@angular/core';

import { User } from "../models/index";
import { UserService } from "../services/index";

@Component({
    moduleId: module.id,
    templateUrl: 'home.component.html'
})
export class HomeComponent implements OnInit {
    currentUser: User;
    users: User[] = [];

    constructor(private UserService: UserService) {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    }

    ngOnInit() {
        this.loadAllUsers();
    }

    deleteUser(id: string) {
        this.UserService.delete(id).subscribe(() => { this.loadAllUsers() });
    }

    private loadAllUsers() {
        this.UserService.getAll().subscribe((users: User[]) => { this.users = users; });
    }
}