import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<div id="outputDiv"></div>',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  label = document.createElement("label");

  ngOnInit(): void {

    // 建立Web Worker
    const heart = new Worker(URL.createObjectURL(new Blob([
      `"use strict";
      onmessage = (e) => {
        postMessage({workerStatus:true});
        debugger;
        postMessage({workerStatus:false});
      };`
    ], { type: "text/javascript" })));


    let resolveVerdict: any;
    let _isDevtoolsOpen: any;

    // 主線程監聽Worker回傳事件 比對狀態是否一致
    const onHeartMsg = (msg: any) => {
      if (msg.data.workerStatus) {
        let p = new Promise((_resolveVerdict) => {
          resolveVerdict = _resolveVerdict;
          setTimeout(() => { resolveVerdict(true); }, 100);
        });
        p.then((verdict) => {
          if (verdict === null) return;
          if (verdict !== _isDevtoolsOpen) {
            _isDevtoolsOpen = verdict;
            const fn = { true: this.onDetectOpen, false: this.onDetectClose }[verdict + ""];
            if (fn) fn();

            this.label.textContent = `DevTool狀態\r\n "${verdict ? '開啟' : '關閉'}"`;
            document.getElementById('outputDiv')?.appendChild(this.label);
          }
          setTimeout(() => { heart.postMessage('initWorkerStatus'); }, 500);
        });
      } else {
        resolveVerdict(false);
      }
    };

    // 將Web worker與主線程事件綁定
    heart.addEventListener("message", onHeartMsg);
    // 啟用第一次循環
    heart.postMessage('initWorkerStatus');
  }

  onDetectOpen() {
  }

  onDetectClose() {
  }
}
