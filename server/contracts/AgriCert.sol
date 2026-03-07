// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AgriCert {
    struct Certification {
        string productId;
        string certificationHash;
        uint256 timestamp;
    }

    mapping(string => Certification) public certifications;

    event CertificationStored(string productId, string certificationHash, uint256 timestamp);

    function storeCertification(string memory _productId, string memory _certificationHash) public {
        require(bytes(certifications[_productId].productId).length == 0, "Product already certified");

        certifications[_productId] = Certification({
            productId: _productId,
            certificationHash: _certificationHash,
            timestamp: block.timestamp
        });

        emit CertificationStored(_productId, _certificationHash, block.timestamp);
    }

    function getCertification(string memory _productId) public view returns (string memory, string memory, uint256) {
        require(bytes(certifications[_productId].productId).length != 0, "Certification not found");
        Certification memory cert = certifications[_productId];
        return (cert.productId, cert.certificationHash, cert.timestamp);
    }
}
