import getIvoicePaymnetDetails from "../repositories/odooInvoicePaymentDetails.js";
import { fetchInvoiceLinesByIds } from "../services/odooInvoiceProductsDetailsService.js";

export const mapinvoiceToTca = async ({ invoice, seller, buyer }) => {
  const CreaditNote = {};
  if (invoice?.move_type == "out_refund") {
    console.log(invoice?.reversed_entry_id[1]);
    CreaditNote["discrepancy_response_code"] = "DL8.61.1.D";
    // DL8.61.1.A: Supply cancelled
    // DL8.61.1.B: Tax treatment changed
    // DL8.61.1.C: Price altered (or Discount provided)
    // DL8.61.1.D: Goods or services returned
    // DL8.61.1.E: Tax charged in error
    // VD: Voluntary Disclosure
    CreaditNote["preceding_invoice_references"] = [
      {
        preceding_invoice_reference: invoice?.reversed_entry_id[1] || null,
        // preceding_invoice_issue_date: "2026-10-15" || null,
      },
    ];
  }
  return {
    name: `${invoice?.type_name} ${invoice?.name}`,
    invoice_number: invoice?.name,
    issue_date: invoice?.invoice_date,
    invoice_type_code: getInvoiceTypeCode(invoice?.move_type),
    detail: {
    ...CreaditNote,
      invoice_currency_code: "AED",
      // vat_point_date: invoice?.invoice_date || null,
      // "Invalid VAT point date: The VAT point date (IBT-007)
      // must be earlier than the invoice issue date."
      payment_due_date: invoice?.invoice_date_due,
      buyer_reference: invoice?.ref || null,
      purchase_order_reference: "PO-2026-001",
      sales_order_reference: invoice?.invoice_origin || null,
      invoice_note: invoice?.narration || null,
      issue_time: separateDateTime(invoice?.create_date).time,
      transaction_type_code: "00000000",
      process_control: {
        profile_id: "urn:peppol:bis:billing",
        customization_id: "urn:peppol:pint:billing-1@ae-1",
      },
      seller: {
        name: seller?.name || null,
        trading_name: seller?.name,
        legal_registration_identifier: "TL-123456",
        legal_registration_identifier_scheme: "0234",
        vat_identifier: "128965374000003",
        tax_scheme: "VAT",
        electronic_address: "1289653740",
        electronic_address_scheme: "0235",
        address_line_1: seller?.street || null,
        address_line_2: seller?.street2 || null,
        city: seller?.city || null,
        post_code: seller?.zip,
        country_subdivision: "DXB",
        country_code: "AE",
        contact_point: "Ahmad Al Mansouri",
        contact_telephone_number: seller?.phone || null,
        contact_email_address: seller?.email || null,
        authority_name: "Department of Economic Development — Dubai",
        legal_registration_identifier_type: "TL",
        // Invalid registration type for a UAE entity. When a legal registration identifier is provided for a UAE party, the registration type must be one of: 'TL' (Commercial/Trade license), 'EID' (Emirates ID), 'PAS' (Passport), 'CD' (Cabinet decision). Update legal_registration_identifier_type to one of these values.
        identifiers: [
          {
            identifier: "1289653740",
            identifier_scheme: "0234",
          },
        ],
      },
      buyer: {
        name: buyer?.name || null,
        trading_name: buyer?.name || null,
        legal_registration_identifier: "LRI-789012",
        legal_registration_identifier_scheme: "0234",
        vat_identifier: "123344558000003",
        tax_scheme: "VAT",
        electronic_address: "1233445580",
        electronic_address_scheme: "0235",
        address_line_1: buyer?.street || null,
        address_line_2: buyer?.street2 || null,
        city: buyer?.city || null,
        post_code: buyer?.zip || null,
        country_subdivision: "AUH",
        country_code: "AE",
        contact_point: "Fatima Al Hashemi",
        contact_telephone_number: buyer?.phone || null,
        contact_email_address: buyer?.email || null,
        authority_name: "Department of Economic Development — Dubai",
        legal_registration_identifier_type: "TL",
        // Invalid registration type for a UAE entity. When a legal registration identifier is provided for a UAE party, the registration type must be one of: 'TL' (Commercial/Trade license), 'EID' (Emirates ID), 'PAS' (Passport), 'CD' (Cabinet decision). Update legal_registration_identifier_type to one of these values.
      },
      delivery: {
        actual_delivery_date: invoice?.delivery_date || null,
        address: {
          address_line_1: `${buyer?.street} ${buyer?.street2}`,
          city: `${buyer?.city}`,
          post_code: `${buyer.zip}`,
          country_subdivision: "AJM",
          country_code: "AE",
        },
      },
      totals: {
        sum_of_invoice_line_net_amount:
          Number(invoice?.amount_untaxed).toFixed(2) || "0.00",
        sum_of_allowances_on_document_level: "0.00",
        sum_of_charges_on_document_level: "0.00",
        invoice_total_amount_without_vat:
          Number(invoice?.amount_untaxed).toFixed(2) || "0.00",
        invoice_total_vat_amount: Number(invoice?.amount_tax).toFixed(2),
        invoice_total_amount_with_vat: Number(invoice?.amount_total).toFixed(2),
        paid_amount: Number(
          invoice?.amount_total - invoice?.amount_residual,
        ).toFixed(2),
        rounding_amount: "0.00",
        amount_due_for_payment: Number(invoice?.amount_residual).toFixed(2),
        invoice_total_amount_with_vat_in_aed: Number(
          invoice?.amount_total,
        ).toFixed(2),
        tax_included_indicator:
          invoice?.document_tax_mode == "tax_included" ? true : false,
      },
      vat_breakdowns: [
        {
          taxable_amount: Number(invoice.amount_untaxed).toFixed(2),
          tax_amount: Number(invoice.amount_tax).toFixed(2),
          vat_category_code: "S",
          tax_scheme_code: "VAT",
          vat_category_rate: "5.00",
        },
      ],
      // extractVatBreakdowns(invoice?.tax_totals),
      lines: await fetchInvoiceLinesByIds({ invoice }),
      allowances: extractAllowancesFromOdoo(invoice),
      payment_instructions: await mapPaymentInstructions(
        invoice?.matched_payment_ids,
      ),
      // charges: [
      //   {
      //     amount: "200.00",
      //     base_amount: "10000.00",
      //     percentage: "2.00",
      //     vat_category_code: "S",
      //     tax_scheme_code: "VAT",
      //     vat_rate: "5.00",
      //     reason: "Shipping and handling",
      //     reason_code: "AA",
      //   },
      // ],

      // terms: [
      //   {
      //     payment_terms: "Net 30 days from invoice date",
      //     terms_amount: "10185.15",
      //     terms_installment_due_date: "2026-10-15",
      //   },
      // ],
    },
  };
};

function getInvoiceTypeCode(moveType) {
  switch (moveType) {
    case "out_invoice":
      return "380";
    case "out_refund":
      return "381";
    case "in_invoice":
      return "480";
    case "in_refund":
      return "81";
    default:
      throw new Error(`invoice moveType is not match (${moveType})`);
  }
}

function separateDateTime(dateTime) {
  const [date, time] = dateTime.split(" ");
  return { date, time };
}

function extractVatBreakdowns(invoiceTaxTotals) {
  if (!invoiceTaxTotals) {
    return [];
  }
  if (
    !invoiceTaxTotals?.subtotals ||
    invoiceTaxTotals?.subtotals?.length === 0
  ) {
    return [];
  }

  const taxGroups = invoiceTaxTotals?.subtotals[0].tax_groups || [];

  const vatBreakdowns = taxGroups?.map((group) => {
    // Calculate the tax rate percentage
    let rate = 0;
    if (group.base_amount > 0) {
      rate = (group.tax_amount / group.base_amount) * 100;
    }

    // Assign category code based on rate (0% -> Z, others -> S)
    const categoryCode = rate === 0 ? "Z" : "S";

    return {
      taxable_amount: group.base_amount.toFixed(2),
      tax_amount: group.tax_amount.toFixed(2),
      vat_category_code: categoryCode,
      tax_scheme_code: "VAT",
      vat_category_rate: rate.toFixed(2),
    };
  });

  return vatBreakdowns;
}

function extractAllowancesFromOdoo(invoiceData) {
  const allowances = [];

  if (!invoiceData) {
    return allowances;
  }

  const discountAmount = invoiceData.global_discount || 0;
  const baseAmount = invoiceData.amount_untaxed || 0;

  if (discountAmount > 0 && baseAmount > 0) {
    const discountPercentage = (discountAmount / baseAmount) * 100;

    allowances.push({
      amount: discountAmount.toFixed(2),
      base_amount: baseAmount.toFixed(2),
      percentage: discountPercentage.toFixed(2),
      vat_category_code: "S",
      tax_scheme_code: "VAT",
      vat_rate: "5.00",
      reason: "Discount",
      reason_code: "95",
    });
  }

  return allowances;
}

async function mapPaymentInstructions(matched_payment_ids = []) {
  const payments = [];
  if (!matched_payment_ids || matched_payment_ids.length === 0) {
    return [
      {
        payment_means_text: `Cash Transfer`,
        payment_means_type_code: "10",
      },
    ];
  }
  for (const payment_id of matched_payment_ids) {
    const { data: payment } = await getIvoicePaymnetDetails({
      paymentId: payment_id,
    });

    payments.push({
      payment_means_type_code: getPaymentMeansTypeCode(payment?.journal_id[1]),
      payment_means_text: `${payment?.journal_id[1]} Transfer`,
      payment_instructions_id: payment?.display_name,
      // payment_account_identifier: "AE070331234567890123456",
      // payment_account_identifier_scheme: "IBAN",
      // payment_account_name: "Actinode Demo Trading LLC",
      // payment_service_provider_identifier: "AEBAAEAD",
    });
  }

  return payments;
}

function getPaymentMeansTypeCode(paymentType = "cash") {
  switch (paymentType.toLowerCase()) {
    case "back":
      return "30";
    case "cash":
      return "10";
    case "card":
      return "48";
    default:
      return null;
  }
}
