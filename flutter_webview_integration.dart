// Flutter WebView Integration for Payment Gateway
// Add this to your Flutter project

import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

class PaymentWebView extends StatefulWidget {
  final String initialUrl;
  final Function(Map<String, dynamic>)? onPaymentResult;

  const PaymentWebView({
    Key? key,
    required this.initialUrl,
    this.onPaymentResult,
  }) : super(key: key);

  @override
  State<PaymentWebView> createState() => _PaymentWebViewState();
}

class _PaymentWebViewState extends State<PaymentWebView> {
  late final WebViewController _controller;
  bool _isLoading = true;
  String? _currentUrl;

  @override
  void initState() {
    super.initState();
    _initializeWebView();
  }

  void _initializeWebView() {
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
              _currentUrl = url;
            });
            print('🔄 Page started loading: $url');
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
            print('✅ Page finished loading: $url');
          },
          onNavigationRequest: (NavigationRequest request) {
            print('🧭 Navigation request: ${request.url}');

            // Handle payment gateway redirects
            if (_isPaymentGatewayUrl(request.url)) {
              print('💳 Payment gateway detected: ${request.url}');
              _handlePaymentGatewayRedirect(request.url);
              return NavigationDecision.prevent;
            }

            // Handle payment completion URLs
            if (_isPaymentCompletionUrl(request.url)) {
              print('✅ Payment completion detected: ${request.url}');
              _handlePaymentCompletion(request.url);
              return NavigationDecision.prevent;
            }

            return NavigationDecision.navigate;
          },
          onWebResourceError: (WebResourceError error) {
            print('❌ WebView error: ${error.description}');
            _showErrorDialog(
              'WebView Error',
              error.description ?? 'Unknown error',
            );
          },
        ),
      )
      ..addJavaScriptChannel(
        'webViewMessage',
        onMessageReceived: (JavaScriptMessage message) {
          print('📨 Message from WebView: ${message.message}');
          _handleWebViewMessage(message.message);
        },
      )
      ..loadRequest(Uri.parse(widget.initialUrl));
  }

  bool _isPaymentGatewayUrl(String url) {
    final paymentGateways = [
      'razorpay.com',
      'payu.in',
      'paytm.com',
      'phonepe.com',
      'google.com/pay',
      'amazon.com/pay',
      'upi://',
      'intent://',
    ];

    return paymentGateways.any(
      (gateway) => url.toLowerCase().contains(gateway),
    );
  }

  bool _isPaymentCompletionUrl(String url) {
    return url.contains('/payment-callback') ||
        url.contains('/payment-success') ||
        url.contains('/payment-failed');
  }

  void _handlePaymentGatewayRedirect(String url) async {
    try {
      // Show loading dialog
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const AlertDialog(
          content: Row(
            children: [
              CircularProgressIndicator(),
              SizedBox(width: 16),
              Text('Redirecting to payment gateway...'),
            ],
          ),
        ),
      );

      // Launch external payment app
      final uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);

        // Wait a bit for payment to complete
        await Future.delayed(const Duration(seconds: 2));

        // Close loading dialog
        Navigator.of(context).pop();

        // Show payment completion dialog
        _showPaymentCompletionDialog();
      } else {
        Navigator.of(context).pop();
        _showErrorDialog('Error', 'Cannot launch payment gateway');
      }
    } catch (e) {
      Navigator.of(context).pop();
      _showErrorDialog('Error', 'Failed to redirect to payment gateway: $e');
    }
  }

  void _handlePaymentCompletion(String url) {
    // Extract payment details from URL
    final uri = Uri.parse(url);
    final paymentId = uri.queryParameters['payment_id'];
    final orderId = uri.queryParameters['order_id'];
    final status = uri.queryParameters['status'];

    if (paymentId != null && orderId != null) {
      final result = {
        'success': status == 'success',
        'payment_id': paymentId,
        'order_id': orderId,
        'status': status,
        'url': url,
      };

      widget.onPaymentResult?.call(result);

      // Navigate back to WebView
      _controller.loadRequest(Uri.parse(widget.initialUrl));
    }
  }

  void _handleWebViewMessage(String message) {
    try {
      final data = json.decode(message);
      final type = data['type'];

      if (type == 'payment_result') {
        widget.onPaymentResult?.call(data);
      }
    } catch (e) {
      print('❌ Failed to parse WebView message: $e');
    }
  }

  void _showPaymentCompletionDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Payment Status'),
        content: const Text(
          'Please check your payment status in the app. '
          'If payment was successful, your wallet will be updated automatically.',
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              // Refresh WebView to check payment status
              _controller.reload();
            },
            child: const Text('Check Status'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
            },
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _showErrorDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Payment'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => _controller.reload(),
          ),
        ],
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading) const Center(child: CircularProgressIndicator()),
        ],
      ),
    );
  }
}

// Usage Example:
class WalletPage extends StatefulWidget {
  @override
  _WalletPageState createState() => _WalletPageState();
}

class _WalletPageState extends State<WalletPage> {
  String _walletUrl = 'https://your-domain.com/partner/wallet';

  void _handlePaymentResult(Map<String, dynamic> result) {
    print('💳 Payment result: $result');

    if (result['success'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Payment successful! Wallet updated.'),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Payment failed: ${result['error'] ?? 'Unknown error'}',
          ),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Wallet')),
      body: PaymentWebView(
        initialUrl: _walletUrl,
        onPaymentResult: _handlePaymentResult,
      ),
    );
  }
}
