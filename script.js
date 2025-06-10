class PomodoroTimer {
    constructor() {
        this.workTime = 25; // 分鐘
        this.breakTime = 5; // 分鐘
        this.currentTime = this.workTime * 60; // 秒
        this.isRunning = false;
        this.isWorkSession = true;
        this.completedSessions = 0;
        this.autoStart = false;
        this.timer = null;
        
        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
        this.loadSettings();
    }
    
    initializeElements() {
        this.timeDisplay = document.getElementById('timeDisplay');
        this.modeDisplay = document.getElementById('modeDisplay');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.workTimeInput = document.getElementById('workTime');
        this.breakTimeInput = document.getElementById('breakTime');
        this.autoStartCheckbox = document.getElementById('autoStart');
        this.completedSessionsDisplay = document.getElementById('completedSessions');
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        this.workTimeInput.addEventListener('change', () => this.updateWorkTime());
        this.breakTimeInput.addEventListener('change', () => this.updateBreakTime());
        this.autoStartCheckbox.addEventListener('change', () => this.updateAutoStart());
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.startBtn.textContent = '運行中...';
            this.startBtn.disabled = true;
            
            this.timer = setInterval(() => {
                this.currentTime--;
                this.updateDisplay();
                
                if (this.currentTime <= 0) {
                    this.completeSession();
                }
            }, 1000);
        }
    }
    
    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            clearInterval(this.timer);
            this.startBtn.textContent = '開始';
            this.startBtn.disabled = false;
        }
    }
    
    reset() {
        this.pause();
        this.currentTime = this.isWorkSession ? this.workTime * 60 : this.breakTime * 60;
        this.updateDisplay();
    }
    
    completeSession() {
        this.pause();
        
        if (this.isWorkSession) {
            this.completedSessions++;
            this.updateCompletedSessions();
            this.showNotification('🎉 工作時間完成！', '是時候休息一下了～');
        } else {
            this.showNotification('✨ 休息時間結束！', '準備開始下一輪工作吧！');
        }
        
        // 切換模式
        this.isWorkSession = !this.isWorkSession;
        this.currentTime = this.isWorkSession ? this.workTime * 60 : this.breakTime * 60;
        this.updateDisplay();
        
        // 自動開始下一輪
        if (this.autoStart) {
            setTimeout(() => {
                this.start();
            }, 2000);
        }
        
        this.saveSettings();
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        this.modeDisplay.textContent = this.isWorkSession ? '工作時間' : '休息時間';
        
        // 更新頁面標題
        document.title = `${this.timeDisplay.textContent} - ${this.modeDisplay.textContent} | 🍅 毛絨番茄鐘`;
        
        // 更新背景顏色
        const body = document.body;
        if (this.isWorkSession) {
            body.style.background = 'linear-gradient(135deg, #ffeef8 0%, #f8d7da 50%, #ffc1cc 100%)';
        } else {
            body.style.background = 'linear-gradient(135deg, #e8f5e8 0%, #d4edda 50%, #c3e6cb 100%)';
        }
    }
    
    updateWorkTime() {
        this.workTime = parseInt(this.workTimeInput.value);
        if (!this.isRunning && this.isWorkSession) {
            this.currentTime = this.workTime * 60;
            this.updateDisplay();
        }
        this.saveSettings();
    }
    
    updateBreakTime() {
        this.breakTime = parseInt(this.breakTimeInput.value);
        if (!this.isRunning && !this.isWorkSession) {
            this.currentTime = this.breakTime * 60;
            this.updateDisplay();
        }
        this.saveSettings();
    }
    
    updateAutoStart() {
        this.autoStart = this.autoStartCheckbox.checked;
        this.saveSettings();
    }
    
    updateCompletedSessions() {
        this.completedSessionsDisplay.textContent = this.completedSessions;
    }
    
    showNotification(title, message) {
        // 瀏覽器通知
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '🍅'
            });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, {
                        body: message,
                        icon: '🍅'
                    });
                }
            });
        }
        
        // 頁面內通知
        this.showPageNotification(title + ' ' + message);
    }
    
    showPageNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(145deg, #ff69b4, #ff1493);
            color: white;
            padding: 15px 20px;
            border-radius: 15px;
            box-shadow: 0 10px 20px rgba(255, 20, 147, 0.3);
            z-index: 1000;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    saveSettings() {
        const settings = {
            workTime: this.workTime,
            breakTime: this.breakTime,
            autoStart: this.autoStart,
            completedSessions: this.completedSessions
        };
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    }
    
    loadSettings() {
        const saved = localStorage.getItem('pomodoroSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.workTime = settings.workTime || 25;
            this.breakTime = settings.breakTime || 5;
            this.autoStart = settings.autoStart || false;
            this.completedSessions = settings.completedSessions || 0;
            
            this.workTimeInput.value = this.workTime;
            this.breakTimeInput.value = this.breakTime;
            this.autoStartCheckbox.checked = this.autoStart;
            this.updateCompletedSessions();
            
            this.currentTime = this.workTime * 60;
            this.updateDisplay();
        }
    }
}

// 添加動畫樣式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 初始化應用
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});
