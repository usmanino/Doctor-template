    var api_key = { "X-API-KEY": "8937363jhdd77867370912" };
	var dataString = {'x': 'NGN'};
    var usd;
    var srate;
    var brate;
    var min_sell;
    var min_buy;
    var address;
    var wallet;
    var btc_value;
	$.ajax({url: bitrade_url + 'api/auth/banks', headers: api_key, method: "GET", data: dataString, dataType: "json"}).done(function( html ) {
      $('#bank_select').html("<option value=''>Select</option>");
      $('#sell_rate').html("₦" + html.rate.sell);
      $('#buy_rate').html("@ ₦" + html.rate.buy + " = 1$");
      usd = html.rate.usd;
      srate = html.rate.sell;
      brate = html.rate.buy;
      min_sell = html.rate.min_sell;
      min_buy = html.rate.min_buy;
      address = html.address.qr + html.address.address + '?amount=';
      wallet = html.address.address;
      btc = min_sell / (usd * srate);
      $('#sell_instruct').html('Min. Bitcoin you can sell is ' + btc.toFixed(8) + ' (BTC)');
      $('#buy_instruct').html('Min. Amount you can buy is ' + numberWithCommas(min_buy) + ' (NGN)');
      $.each(html.banks, function( index, value ) {
          $('#bank_select').append($("<option></option>").attr("value",value.id).text(value.bank_name));
      });
    }).error(function( h ) { console.log(h); });

    var amount;
    function next_sell_1()
    {
        amount = $('#sell_amount').val();
        conv = amount * usd * srate;
        if(conv < min_sell)
        {
            btc = min_sell / (usd * srate);
            alert('The Minimum Bitcoin you can sell is ' + btc.toFixed(8));
            $('#sell_amount').focus();
            return false;
        }
        $('#error_sell').html('');
        $('#sell-page-1').hide();
        $('#sell-page-2').show();
    }

    var bank;
    var account_no;
    var account_name;
    function ResolveAccount()
    {
        bank = $('#bank_select').val();
        account_no = $('#account_no').val();
        if(account_no == "" || bank == "")
        {
            return false;
        }
        $("#account_name").html("Resolving Account...");
        var dataString = {'account_no': account_no, 'bank': bank};
        var endpointUri = bitrade_url + "api/auth/verifyaccount";
        sendApiRequest("POST", endpointUri, dataString, getVerifyBankCallback, getVerifyBankErrorCallback);
    }

    function getVerifyBankCallback(data) {
        $('#account_name').html(data.account_name);
    }

    function getVerifyBankErrorCallback(data) {
        $('#account_name').html(data.responseJSON.message);   
    }

    var email;
    function next_sell_2()
    {
        email = $('#email').val();
        var re = /[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}/igm;
        if (!re.test(email) && email!="")
        {
            alert("Please enter a valid email.");
            $('#email').focus();
            return false;
        }
        $('#btc_amt_trans').html("Transfer " + amount + " BTC to the below wallet address")
        draw = address + amount;
        $('#wallet_qr').attr("src", draw);
        $('#btc_wallet_address').html(wallet);
        $('#sell-page-2').hide();
        $('#sell-page-3').show();
    }

    function submitSell()
    {
        $("#sell_button").html("Processing...").attr('disabled', 'disabled');
        var endpointUri = bitrade_url + "api/auth/sell";
        var dataString = {
            'email': email,
            'amount': amount,
            'bank' : bank,
            'account_no' : account_no,
            'account_name' : account_name
        };
        sendApiRequest("POST", endpointUri, dataString, getSellSuccessCallback, getSellErrorCallback);
    }

    function getSellSuccessCallback(data) {
        $('#invoice_num').html(data.data.receipt_no);
        $('#invoice_amount').html("₦" + data.data.amount);
        $('#btc_amount').html(amount);
        $('#wallet_num').html(data.data.wallet_address);
        $('#sell_message').html(data.message);
        $('#sell-page-3').hide();
        $('#sell-page-4').show();
    }

    function getSellErrorCallback(data) {
        $("#sell_button").html("Yes, I have make the transfer").attr('disabled', false);
        alert(data.responseJSON.message);
    }

    var bit_amount;
    function next_buy_1()
    {
        bit_amount = $('#buy_amount').val();
        if(bit_amount == "")
        {
            alert('Please enter amount greater or equal ' + numberWithCommas(min_buy));
            $('#buy_amount').focus();
            return false;
        }
        if(eval(bit_amount) < eval(min_buy))
        {
            alert('The Minimum Amount you can buy is ' + numberWithCommas(min_buy));
            $('#buy_amount').focus();
            return false;
        }
        $('#error_buy').html('');
        $('#buy-page-1').hide();
        $('#buy-page-2').show();
    }

    var bit_email;
    var bit_address;
    function buy()
    {
        var amt;
        amt = eval(bit_amount);
        bit_email = $('#buy_email').val();
        bit_address = $('#buy_address').val();
        if(bit_email == "")
        {
            alert("Please enter your email!");
            $('#buy_email').focus();
            return false;
        }
        if(bit_address == "")
        {
            alert("Please enter BTC wallet address you want us to credit!");
            $('#buy_address').focus();
            return false;
        }
        if(amt == "" || amt < min_buy)
        {
            alert("Please enter amount that is greater or equal to " + min_buy);
            $('#buy_amount').focus();
            return false;
        }
        amt = Math.ceil(amt * 100);
        var ref = IDGenerator();
        email = bit_email;
        var handler = PaystackPop.setup({
        key: 'pk_live_6250106459253d0279ea2dd626be943e83cfea87',
        email: email,
        amount: amt,
        currency: 'NGN',
        ref: ref,
        callback: function(response){
          //alert('success. transaction ref is ' + response.reference);
          $("#btc_buy").html('Processing...').attr("disabled", "disabled");
          var dataString = {'email': email, 'amount': bit_amount, 'wallet_address': bit_address, 'btc': btc_value, 'ref_no': response.reference};
          var paypointUri = bitrade_url + "api/auth/buy";
          sendApiRequest("POST", paypointUri, dataString, getPaymentCallback, getPaymentErrorCallback);
        },
        onClose: function(){
          //alert('window closed');
        }
        });
        handler.openIframe();
    }

    function getPaymentCallback(data)
    {
        $("#btc_buy").html('Buy').attr("disabled", false);
        alert(data.message);
        $('#invoice_num_buy').html(data.data.receipt_no);
        $('#invoice_amount_buy').html("₦" + data.data.amount);
        $('#btc_amount_buy').html(data.data.btc_value);
        $('#wallet_num_buy').html(data.data.wallet_address);
        $('#buy_message').html(data.message);
        $('#buy-page-2').hide();
        $('#buy-page-3').show();
    }
    function getPaymentErrorCallback(data)
    {
        $("#btc_buy").html('Buy').attr("disabled", false);
        alert(data.responseJSON.message);
    }

    function TrackTransaction()
    {
        receipt_no = $('#receipt_no').val();
        if(receipt_no == "")
        {
            alert("Please enter your receipt number");
            $('#receipt_no').focus();
            return false;
        }
        $("#track").html("Searching...").attr("disabled", 'disabled');
        var dataString = {'receipt_no': receipt_no};
        var endpointUri = bitrade_url + "api/auth/track";
        sendApiRequest("POST", endpointUri, dataString, getTrackCallback, getTrackErrorCallback);
    }

    function getTrackCallback(data)
    {
        $("#track").html('Track').attr("disabled", false);
        $('#trans_amount').html("₦" + data.data.amount);
        $('#btc_amount').html(data.data.btc_value + "BTC");
        $('#trans_rate').html("₦" + data.data.rate);
        $('#trans_date').html(data.data.date);
        $('#status').html(data.data.status);
        $('#market').html(data.data.market);
        $('#message').html(data.message);
        $('#track-page').show(500);
    }
    function getTrackErrorCallback(data)
    {
        $("#track").html('Track').attr("disabled", false);
        console.log(data);
        alert(data.responseJSON.message);
    }