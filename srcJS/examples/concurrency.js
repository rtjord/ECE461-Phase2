"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function task1() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Task 1 started");
        // Simulating some work
        yield new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
        console.log("Task 1 completed");
    });
}
function task2() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Task 2 started");
        // Simulating some work
        yield new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
        console.log("Task 2 completed");
    });
}
function task3() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Task 3 started");
        // Simulating some work
        yield new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
        console.log("Task 3 completed");
    });
}
function forkJoin() {
    return __awaiter(this, void 0, void 0, function* () {
        const promises = [task1(), task2(), task3()];
        yield Promise.all(promises);
        console.log("All tasks completed");
    });
}
forkJoin();
