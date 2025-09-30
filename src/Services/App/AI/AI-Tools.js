let tools = {
    'get_weather_data': {
        name: 'get_weather_data',
        description: 'Retrieves only current weather details for a given location.',
        parameters: {
            location: {
                type: 'string',
                description: 'The name of a city, state, or country.'
            },
            type: {
                type: 'string',
                description: 'This can be Temperature, Humidity, Wind, Cloudiness, All'
            },
            validation:{
                type: 'string',
                description: 'Name of the data user wants to fetch (this field is required to validate the tool response)'
            }
        }
    },
    'create_sales_report_for_product': {
        name: 'create_sales_report_for_product',
        description: 'create only sales report for a selected product',
        parameters: {
            product_name: {
                type: 'string',
                description: 'Name of the product'
            },
            other_details:{
                type: 'array of object',
                description: 'list any other details which can be used for report creation'
            },
            validation:{
                type: 'string',
                description: 'Name of the report user wants to create(this field is required to validate the tool response)'
            }
        }
    },
    'create_sales_report_for_service': {
        name: 'create_sales_report_for_service',
        description: 'create only sales report for a selected service',
        parameters: {
            service_name: {
                type: 'string',
                description: 'Name of the service'
            },
            other_details:{
                type: 'array of object',
                description: 'list any other details which can be used for report creation'
            },
            validation:{
                type: 'string',
                description: 'Name of the report user wants to create(this field is required to validate the tool response)'
            }
        }
    }
};

export {
    tools
}