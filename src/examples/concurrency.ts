async function task1() {
    console.log("Task 1 started");
    // Simulating some work
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
    console.log("Task 1 completed");
}

async function task2() {
    console.log("Task 2 started");
    // Simulating some work
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
    console.log("Task 2 completed");
}

async function task3() {
    console.log("Task 3 started");
    // Simulating some work
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
    console.log("Task 3 completed");
}
async function forkJoin() {
    const promises = [task1(), task2(), task3()];
    await Promise.all(promises);
    console.log("All tasks completed");
}

forkJoin();