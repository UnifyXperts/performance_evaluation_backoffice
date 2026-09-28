frappe.ui.form.on("Performance Evaluation", {

    evaluation_template: function(frm) {
        if (!frm.doc.evaluation_template) {
            return;
        }

        fetch_template_questions(frm);
    },
    validate: function(frm) {

        let employee_total = 0;
        let manager_total = 0;
        let total_rows = 0;

        sections.forEach(sec => {

            let section_employee_total = 0;
            let section_manager_total = 0;

            (frm.doc[sec.table] || []).forEach(row => {

                section_employee_total += flt(row.employee_score);
                section_manager_total += flt(row.manager_score);

                total_rows++;
            });

            // Section total / average
            let rows = (frm.doc[sec.table] || []).length;

            let section_average = rows > 0
                ? (
                    section_employee_total +
                    section_manager_total
                ) / (rows * 2)
                : 0;

            frm.set_value(
                sec.total_fieldname,
                flt(section_average, 3)
            );

            employee_total += section_employee_total;
            manager_total += section_manager_total;
        });

        // Employee average
        let employee_avg = total_rows > 0
            ? employee_total / total_rows
            : 0;

        // Manager average
        let manager_avg = total_rows > 0
            ? manager_total / total_rows
            : 0;

        frm.set_value(
            "employee_total_score",
            flt(employee_avg, 3)
        );

        frm.set_value(
            "manager_average_score",
            flt(manager_avg, 3)
        );
    }
});


// ---------------------------------------------------------
// Sections
// ---------------------------------------------------------

const sections = [
    {
        table: "table_eoum",
        total_fieldname: "total_score_i"
    },
    {
        table: "table_yans",
        total_fieldname: "total_score_ii"
    },
    {
        table: "table_dhbr",
        total_fieldname: "total_score_iii"
    },
    {
        table: "table_zazv",
        total_fieldname: "total_score_iv"
    },
    {
        table: "table_htwv",
        total_fieldname: "total_score_v"
    },
    {
        table: "table_piwa",
        total_fieldname: "total_score_vi"
    }
];


// ---------------------------------------------------------
// Section total
// ---------------------------------------------------------

function calculate_final_score(frm) {

    let employee_avg = flt(frm.doc.employee_total_score);

    let manager_avg = flt(frm.doc.manager_average_score);

    let overall_rating = flt(frm.doc.overall_performance_rating);
 
    let final_score = (employee_avg + manager_avg + overall_rating) / 3;
 
    frm.set_value('final_score', final_score.toFixed(3));

    frm.refresh_field('final_score');

}
 

function total_score_calculator(frm, table, fieldname) {

    let total = 0;

    let row_count = 0;
 
    (frm.doc[table] || []).forEach(row => {

        total += flt(row.employee_score) + flt(row.manager_score);

        row_count++;

    });
 
    // Normalize to a score out of 5

    let average_score = row_count > 0 ? (total / (row_count * 2)) : 0;
 
    frm.set_value(fieldname, average_score.toFixed(3)); // e.g. 3.875

    frm.refresh_field(fieldname);

}
 



const SECTION_MAP = [
    ["table_toog", "table_eoum"],
    ["table_oudw", "table_yans"],
    ["table_aikc", "table_dhbr"],
    ["table_fnzt", "table_zazv"],
    ["table_ktfa", "table_htwv"],
    ["table_zntg", "table_piwa"],
    ["assessment_questions", "table_ovwz"]
];




function fetch_template_questions(frm) {
    
    frappe.model.with_doc(
        "Performance Evaluation Template",
        frm.doc.evaluation_template,
        function() {

            let template = frappe.get_doc(
                "Performance Evaluation Template",
                frm.doc.evaluation_template
            );

            SECTION_MAP.forEach(([tpl_field, eval_field]) => {

                frm.clear_table(eval_field);


                (template[tpl_field] || []).forEach(row => {
                    (template.assessment_questions || []).forEach(row => {

    console.log("MANAGER ROW:", row);
    console.log("QUESTION:", row.assessment_questions);

});
                    let new_row = frm.add_child(eval_field);

                    new_row.no = row.no;
                    console.log(row,new_row)

                    new_row.assessment_question =
                        row.assessment_question || row.assessment_questions || "";

                });

                frm.refresh_field(eval_field);
            });

            frm.dirty();

            frappe.show_alert({
                message: "Questions fetched from template",
                indicator: "green"
            });
        }
    );
}