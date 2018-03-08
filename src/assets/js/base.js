var map;
var last_click_latlng;


/*********************************************************
* HELPERS
*********************************************************/

function get_config_value(str, default_val) {
    return (typeof Nominatim_Config[str] !== 'undefined' ? Nominatim_Config[str] :  default_val);
}

function parse_and_normalize_geojson_string(part){
    // normalize places the geometry into a featurecollection, similar to
    // https://github.com/mapbox/geojson-normalize
    var parsed_geojson = {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                geometry: part,
                properties: {}
            }
        ]
    };
    return parsed_geojson;
}

function map_link_to_osm(){
    return "https://openstreetmap.org/#map=" + map.getZoom() + "/" + map.getCenter().lat + "/" + map.getCenter().lng;
}

function map_viewbox_as_string() {
    // since .toBBoxString() doesn't round numbers
    return [
        map.getBounds().getSouthWest().lng.toFixed(5), // left
        map.getBounds().getNorthEast().lat.toFixed(5), // top
        map.getBounds().getNorthEast().lng.toFixed(5), // right
        map.getBounds().getSouthWest().lat.toFixed(5)  // bottom
    ].join(',');
}


/*********************************************************
* PAGE HELPERS
*********************************************************/

function fetch_from_api(endpoint_name, params, callback) {

    // `&a=&b=&c=1` => '&c='
    for(var k in params) {
        if (typeof(params[k]) === 'undefined' || params[k] === '' || params[k] === null ) delete params[k];
    }

    var api_url = get_config_value('Nominatim_API_Endpoint') + endpoint_name + '.php?' + $.param(params);
    if (endpoint_name !== 'status') {
        $('#api-request-link').attr('href', api_url);
    }
    $.get(api_url, function(data){
        callback(data);
    });
}

function update_data_date() {
    fetch_from_api('status', {format: 'json'}, function(data){
        $('#data-date').text(data.data_last_updated.formatted);
    });
}

function render_template(el, template_name, page_context) {
    var template_source = $('#' + template_name).text();
    var template = Handlebars.compile(template_source);
    var html    = template(page_context);
    el.html(html);
}

function show_error(html) {
    $('#error-overlay').html(html).show();   
}

function hide_error() {
    $('#error-overlay').empty().hide();    
}


$(document).ajaxError(function(event, jqXHR, ajaxSettings, thrownError) {
    // console.log(thrownError);
    // console.log(ajaxSettings);
    show_error('Error fetching results from <a href="' + ajaxSettings.url + '">' + ajaxSettings.url + '</a>');
});


jQuery(document).ready(function(){
    hide_error();
});

