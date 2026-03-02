export const Debug = {
    log(msg, type = 'info', meta = '') {
        const con = document.getElementById('console');
        if (!con) {
            console[type === 'sys' || type === 'event' ? 'log' : type](`[${type.toUpperCase()}] ${msg}`, meta);
            return;
        }

        const colors = {
            info: 'text-blue-400',
            warn: 'text-yellow-400',
            error: 'text-red-400',
            sys: 'text-purple-400',
            event: 'text-green-400'
        };
        const time = new Date().toISOString().split('T')[1].slice(0, 12);
        const el = document.createElement('div');
        el.className = 'border-l-2 border-gray-700 pl-2 opacity-90 hover:opacity-100 transition-opacity';
        el.innerHTML = `
            <span class="text-gray-500">[${time}]</span> 
            <span class="${colors[type]} font-semibold">[${type.toUpperCase()}]</span> 
            <span class="text-gray-300">${msg}</span>
            ${meta ? `<span class="text-gray-500 block ml-4 text-[10px] mt-1">${meta}</span>` : ''}
        `;
        con.appendChild(el);
        con.scrollTop = con.scrollHeight;
        console[type === 'sys' || type === 'event' ? 'log' : type](`[${type.toUpperCase()}] ${msg}`, meta);
    }
};