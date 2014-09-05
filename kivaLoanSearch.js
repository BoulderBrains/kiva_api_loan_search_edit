var updated_loans=[];
//figure out how to check LocalStorage to see if there is anything in there.
function handle_loans_ajax_request(loans_data) {
    iterate_loans(loans_data);

    $("#initial_wrapper").on('click', 'p.editDescription', function(event) {
        $(event.target).attr('contenteditable', true);
        var button = $(event.target).siblings('button');
        button.show();
    });

    //Save the changes made to the loan description locally
    $('#initial_wrapper').on('click', 'button', function(event) {
        //var loan_ids;
        var loan_id = parseInt($(this).parent().attr('id'), 10);
        var description_new = $(this).parent().find('.editDescription').text();
        //loan = JSON.parse(window.localStorage.getItem(loan_id));
        window.localStorage.setItem(loan_id + "update", description_new);

        updated_loans = JSON.parse(window.localStorage.getItem("updated_loans"));

        if (updated_loans === null) {
            updated_loans = [];
        }
        updated_loans.push(loan_id);
        window.localStorage.setItem("updated_loans", JSON.stringify(updated_loans));

        //Preventing the loan description from being editable and hiding the save button upon clicking the Save button
        $(this).hide();

        var description = $(this).siblings('p');
        description.attr('contenteditable', false);

        //This is generating the link to allow users to view the changes that they've made.
        if ($("#change_link").length == 0) {
            create_change_link();
        }
    });
}

//Creating the View Your Changes link
function create_change_link() {
    $("#initial_wrapper").prepend('<a id="change_link" href="#">View your changes</a>');
    $('#change_link').click(handle_change_link_click);
}

function handle_back_link_click() {
    $("#saved_wrapper").hide().empty();
    $("#initial_wrapper").show(); 
}

function handle_change_link_click() {
    updated_loans = JSON.parse(window.localStorage.getItem("updated_loans"));

    for (var i = 0; i< updated_loans.length; i++) {
        var loan_id = updated_loans[i];
        var saved_wrapper = $('#saved_wrapper');
        var	holder = $('<div id="' + loan_id + '"></div>');

        var	loan = JSON.parse(window.localStorage.getItem(loan_id));


        description_new_text = window.localStorage.getItem(loan_id + "update");

        var	description_new = $('<p style="font-weight: bold"> Edited Description </p> <p class="description_new">' + description_new_text + '</p>');
        var	description_old = $('<p style="font-weight: bold"> Original Description </p> <p class="description_old">' + loan.description.texts.en + '</p>');

        holder.append('<p style="font-weight: bold"> Borrower Name </p> <p>' + loan.name + '</p>');
        holder.append('<p style="font-weight: bold"> Loan ID </p> <p>' + loan.id + '</p>');
        holder.append(description_new);
        holder.append(description_old);

        saved_wrapper.append(holder);
    }
    $("#saved_wrapper").prepend('<a id="back_link" href="#">Go back to loans</a>');
    $('#back_link').click(handle_back_link_click);

    $("#initial_wrapper").hide();
    $("#saved_wrapper").show(); 

}

//This function is getting a list of the loan_ids that have been edited
function get_updated_loan_ids() {
    var loan_ids;
    //Getting the loan_ids value from local storage 
    loan_ids = window.localStorage.getItem("updated_loans");
    //List of changed loan ids of loans with edited descriptions hasn't been created yet.
    if (typeof(loan_ids) === "string") {
        loan_ids=JSON.parse(updated_loans);
    }
    else {
        loan_ids = [];
    }
    return(loan_ids);
}

function iterate_loans(loans_data) {
    var items = [];

    // This is constructing the DOM
    $.each(loans_data.loans, function(key, loan) {
        $.getJSON('http://api.dev.kivaws.org/v1/loans/'+loan.id+'.json?app_id=org.joshua.test', function(loan_data) {
            //Stripping HTML tags from: 
            //https://stackoverflow.com/questions/822452/strip-html-from-text-javascript
            loan_data.loans[0].description.texts.en = loan_data.loans[0].description.texts.en.replace(/<(?:.|\n)*?>/gm, ' ');
            window.localStorage.setItem(loan.id, JSON.stringify(loan_data.loans[0]));
            var wrapper = $('#initial_wrapper');
            var saved_wrapper = $('#saved_wrapper');
            var holder = $('<div id="' + loan_data.loans[0].id + '"></div>');
            var description = '<p class="editDescription">' + loan_data.loans[0].description.texts.en + '</p>';
            var button = $('<button>Save</button>');


            holder.append('<p style="font-weight: bold"> Borrower Name </p> <p>' + loan_data.loans[0].name + '</p>');
            holder.append('<p style="font-weight: bold"> Loan ID </p> <p>' + loan_data.loans[0].id + '</p>');
            holder.append('<p style="font-weight: bold"> Description </p> <p>' + description + '</p>');
            holder.append(button);


            wrapper.append(holder);
            button.hide();
            saved_wrapper.hide();
        });
    });
}

$(document).ready(function() {
// Request loan data
    var loan_id_list = "2930,2931,2932,2933,2934,2935,2936,2937,2938,2939,2940,2941,2942,2943,2944,2945,2946,2947,2948,2949,2950";
    var url = "http://api.kivaws.org/v1/loans/" + loan_id_list + ".json?app_id=org.joshua.test";

    $.getJSON(url, handle_loans_ajax_request);
});