export async function registerStandardPlugins() {


    //Light Plugin Extension
    const { Light } = await import('./Core/Light.js');
    const { StandardLight } = await import('./Light/Standard.js');

    Light.register('hemispheric', StandardLight);
    Light.register('directional', StandardLight);
    Light.register('point', StandardLight);
}