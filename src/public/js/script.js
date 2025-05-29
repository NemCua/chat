document.getElementById('sendForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // 🚫 Chặn reload

    const form = e.target;
    const formData = new FormData(form);
    const data = new URLSearchParams(formData); // để gửi như form
    
    try {
        const res = await fetch('/send-messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: data
        });

        const text = await res.text();
        document.getElementById('status').textContent = text;
    } catch (err) {
        console.error(err);
        document.getElementById('status').textContent = 'Lỗi khi gửi tin nhắn';
    }
});