



import puppeteer from 'puppeteer';

function generateHtml(options) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
    <style>

    </style>
</head>
<body>
    <div class="p-10">
        <!--Logo and Other info-->
        <div class="flex items-start justify-center">
            <div class="flex-1">
                <div class="w-60 pb-6">
                    <a href='www.google.com'>LOGO</a>
                </div>
                
                <div class="w-60 pl-4 pb-6">
                    <h3 class="font-bold">Mr. Johnson</h3>
                    <p>12, Adewale Street, Lagos</p>
                    <p>Nigeria</p>
                </div>
                
                <div class="pl-4 pb-20">
                    <p class="text-gray-500">Bill To:</p>
                    <h3 class="font-bold">${
                      options?.customerName ?? Mr.Johnson
                    }</h3>
                </div>
                
            </div>
            <div class="flex items-end flex-col">
                <div class="pb-16">
                    <h1 class=" font-normal text-4xl pb-1">Delivery Report</h1>
                    <p class="text-right text-gray-500 text-xl"># ${
                      options.orderId ?? '108hsbsssjh'
                    }</p>
                </div>
                <div class="flex">
                    <div class="flex flex-col items-end">
                        <p class="text-gray-500 py-1">Date:</p>
                        <p class="text-gray-500 py-1">Payment Terms:</p>
                        <p class="font-bold text-xl py-1 pb-2 ">Balance Due:</p>
                    </div>
                    <div class="flex flex-col items-end w-[12rem] text-right">
                        <p class="py-1">${options.date ?? new Date()}</p>
                        <p class="py-1 pl-10">The terms</p>
                        <div class="pb-2 py-1">
                            <p class="font-bold text-xl">N34, 000</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!--Items List-->
        <div class="table w-full">
            <div class=" table-header-group bg-gray-700 text-white ">
                <div class=" table-row ">
                    <div class=" table-cell w-6/12 text-left py-2 px-4 rounded-l-lg border-x-[1px]">Item</div>
                    <div class=" table-cell w-[10%] text-center border-x-[1px]">Quantity</div>
                    <div class=" table-cell w-2/12 text-center border-x-[1px]">Rate</div>
                    <div class=" table-cell w-2/12 text-center rounded-r-lg border-x-[1px]">Amount</div>
                </div>
            </div>
           
        </div>
        
        <!--Total Amount-->
        <div class=" pt-20 pr-10 text-right">
            <p class="text-gray-400">Total: <span class="pl-24 text-black">₹${
              options.total ?? N56888
            }</span></p>
        </div>
        <!--Notes and Other info-->
        <div class="py-6">
            <p class="text-gray-400 pb-2">Notes:</p>
            <p>use this test</p>
        </div>
        <div class="">
            <p class="text-gray-400 pb-2">Terms:</p>
            <p>use this test</p>
        </div>
    </div>
</body>
</html>
    `

}

async function generateInvoice(data) {
  const options = { format: 'A4' };

  const html = generateHtml(data);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  const pdf = await page.pdf(options);
  
  await browser.close();

  return pdf;
}

export default generateInvoice;
