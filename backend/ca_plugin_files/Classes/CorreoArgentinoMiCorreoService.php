<?php
class CorreoArgentinoMiCorreoService implements CorreoArgentinoServiceMiCorreoInterface {
    public function login()
    {
        $headers = $this->setHeaders([
            "Authorization" => "Basic " . $this->authHash
        ]);

        $request = wp_remote_post(
            $this->url . '/token',
            [
                'method' => 'POST',
                'headers' => $headers,
            ]
        );
        // ...
    }

    public function setHeaders($headers = [])
    {
        $defaultHeaders = [
            "Content-Type" => "application/json",
            "Accept" => "application/json",
            "Connection" => "keep-alive",
        ];
        return array_merge($defaultHeaders, $headers);
    }

    public function getCalculatedRates($postalCode, $deliveryType, $dimensions, $settings = null)
    {
        $headers = $this->setHeaders([
            "Authorization" => "Bearer " . $this->accessToken
        ]);

        $body = [
            "customerId" => $settings["customer_id"],
            "postalCodeOrigin" => Utils::normalizeZipCode($settings["zip_code"]),
            "postalCodeDestination" => Utils::normalizeZipCode($postalCode),
            "deliveredType" => $deliveryType,
            "dimensions" => $dimensions // array of integers
        ];

        $request = wp_safe_remote_post(
            $this->url . '/rates',
            [
                'method' => 'POST',
                'headers' => $headers,
                'body' => json_encode($body)
            ]
        );
        // ...
    }
}
