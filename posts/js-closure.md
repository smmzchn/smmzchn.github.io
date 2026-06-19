---
title: 我理解的 JavaScript 闭包
date: 2026-06-19
tag: tech
excerpt: 闭包这个词听起来很高大上，但其实概念很简单。这篇文章用最直白的方式讲清楚它到底是什么、为什么有用。
---

# 我理解的 JavaScript 闭包

> 闭包（Closure）这个词听起来很高大上，但其实概念非常简单。

## 一句话解释

**闭包 = 函数 + 它能访问的外部变量**

换句话说：一个函数"记住了"它出生地的环境，即使那个地方已经执行完了，它依然能访问那些变量。

## 最简单的例子

```js
function outer() {
  let count = 0;

  return function inner() {
    count++;
    console.log(count);
  };
}

const counter = outer();
counter(); // 1
counter(); // 2
counter(); // 3
```

`inner` 函数就是一个闭包——它"记住"了 `count` 这个变量，哪怕 `outer()` 早就执行完了。

## 为什么这有用？

### 1. 数据私有化

闭包可以模拟"私有变量"，这是 JS 里最常见的用法之一：

```js
function createBankAccount(initialBalance) {
  let balance = initialBalance; // 外部无法直接访问

  return {
    deposit(amount) {
      balance += amount;
      console.log(`存款成功，余额：${balance}`);
    },
    withdraw(amount) {
      if (amount > balance) {
        console.log("余额不足！");
        return;
      }
      balance -= amount;
      console.log(`取款成功，余额：${balance}`);
    },
    getBalance() {
      return balance;
    }
  };
}

const myAccount = createBankAccount(100);
myAccount.deposit(50);   // 存款成功，余额：150
myAccount.withdraw(30);  // 取款成功，余额：120
console.log(myAccount.balance); // undefined ← 直接访问不到！
```

`balance` 被"保护"在闭包里了，只能通过返回的方法来操作。

### 2. 函数工厂

闭包可以动态生成具有特定行为的函数：

```js
function multiplyBy(n) {
  return function (x) {
    return x * n;
  };
}

const double = multiplyBy(2);
const triple = multiplyBy(3);

double(5); // 10
triple(5); // 15
```

### 3. 事件处理和回调

这是日常开发中最常见的场景：

```js
function setupButton(buttonId) {
  let clickCount = 0;
  const btn = document.getElementById(buttonId);

  btn.addEventListener("click", function () {
    clickCount++;
    btn.textContent = `点击了 ${clickCount} 次`;
  });
}

setupButton("myBtn");
```

每次点击时，回调函数是闭包，记住了 `clickCount`。

## 一个经典坑：循环 + var

```js
for (var i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i); // 输出什么？
  }, 1000);
}
```

**直觉上**你希望输出 `0 1 2`，但实际上是 `3 3 3`。

原因：`var` 没有块级作用域，三次循环共享同一个 `i`，等 `setTimeout` 回调执行时，循环早就结束了，`i` 已经是 `3`。

**解决办法**：用 `let`（块级作用域）或者闭包：

```js
// 方法一：let（推荐）
for (let i = 0; i < 3; i++) {
  setTimeout(function () {
    console.log(i); // 0 1 2 ✓
  }, 1000);
}

// 方法二：IIFE 闭包
for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(function () {
      console.log(j); // 0 1 2 ✓
    }, 1000);
  })(i);
}
```

## 总结

| 要点 | 说明 |
|------|------|
| 闭包是什么 | 函数能访问其词法作用域里的变量 |
| 核心特征 | "记住"了出生环境 |
| 常见用途 | 私有变量、函数工厂、回调 |
| 注意事项 | 可能造成内存占用，用完及时释放引用 |

闭包不是什么高深的概念，**你其实天天在用，只是不知道它叫这个名字而已**。

---

*如果有疑问或者我觉得哪里讲得不清楚，欢迎留言讨论 👇*
