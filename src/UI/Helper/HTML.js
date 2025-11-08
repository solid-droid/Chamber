export function HTML(htmlText, data) {
    const evaluateExpression = (expression, localContext = {}) => {
        const allContext = { ...data, ...localContext };
        try {
            const keys = Object.keys(allContext);
            const values = Object.values(allContext);
            const fn = new Function(...keys, `return (${expression});`);
            return fn(...values);
        } catch (e) {
            console.error('Template Expression Error:', expression, e);
            return null;
        }
    };

    htmlText = htmlText && htmlText.default ? htmlText.default : htmlText;
    let result = htmlText;
    let changed;

    // FOR Loops
    const forRegex = /{% for\s+([a-zA-Z_]\w*)\s+in\s+([a-zA-Z_.$0-9]*)\s*%}(.*?){%\s*endfor\s*%}/gs;
    do {
        changed = false;
        result = result.replace(forRegex, (match, itemName, listPath, innerContent) => {
            changed = true;
            let list = evaluateExpression(listPath);

            if (!Array.isArray(list)) return '';

            let iteratedContent = '';
            list.forEach((item, index) => {
                const localContext = { [itemName]: item, i: index };
                iteratedContent += HTML(innerContent, { ...data, ...localContext });
            });

            return iteratedContent;
        });
    } while (changed);

    // IF Conditions
    const ifRegex = /{% if\s+(.*?)\s*%}(.*?){%\s*endif\s*%}/gs;
    do {
        changed = false;
        result = result.replace(ifRegex, (match, condition, innerContent) => {
            changed = true;
            if (evaluateExpression(condition)) {
                return HTML(innerContent, data);
            } else {
                return '';
            }
        });
    } while (changed);

    // Variable Substitution
    const variableRegex = /\${(.*?)}/g;
    result = result.replace(variableRegex, (match, expression) => {
        const evaluatedValue = evaluateExpression(expression);
        return (evaluatedValue === null || evaluatedValue === undefined) ? '' : String(evaluatedValue);
    });

    return result;
}

// --- Example Usage ---
// variable     => ${title}
// if condition => {% if products.length > 0 %} ....  {% endif %}
// for loop     => {% for product in products %} ... {% endfor %}

// const templateData = {
//     title: 'Product Catalog',
//     user: {
//         name: 'Jane Doe',
//         role: 'Admin'
//     },
//     products: [
//         { id: 1, name: 'Laptop', price: 1200, available: true },
//         { id: 2, name: 'Mouse', price: 25, available: true },
//         { id: 3, name: 'Keyboard', price: 70, available: false }
//     ],
//     showAdminMessage: true,
//     minPrice: 50,
// };

// const htmlTemplate = `
//     <header>
//         <!-- Case 1: Variable Usage -->
//         <h1>${title} - Welcome, ${user.name}!</h1>
        
//         <!-- Case 2: IF Condition (using boolean variable, now testing negation) -->
//         {% if !showAdminMessage %}
//             <p class="admin-note">This message only appears when showAdminMessage is false (i.e., when negated true).</p>
//         {% endif %}

//         <!-- Case 2: IF Condition (using complex expression) -->
//         {% if products.length > 0 %}
//             <h2>Items Available: ${products.length}</h2>
//         {% endif %}
//     </header>

//     <main>
//         <!-- Case 3: FOR Loop -->
//         <ul class="product-list">
//             {% for product in products %}
//                 <li data-id="${product.id}" class="item ${product.available ? 'in-stock' : 'out-of-stock'}">
//                     Product: ${product.name} (Price: \$${product.price})
                    
//                     <!-- Case 2: Nested IF Condition -->
//                     {% if product.available %}
//                         <!-- Case 1: Nested Variable Usage -->
//                         <span class="status">In Stock</span>
//                     {% endif %}

//                     <!-- Case 2: Condition based on loop item property and global variable -->
//                     {% if product.price > minPrice %}
//                         <small> (Premium Item)</small>
//                     {% endif %}
//                 </li>
//             {% endfor %}
//         </ul>
//     </main>
// `;

// const renderedHtml = HTML(htmlTemplate, templateData);

