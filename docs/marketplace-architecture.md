# Architecture Marketplace SIBIO

Ce socle transforme la boutique statique en architecture marketplace multi-vendeurs.

## Principe Central

Le client voit une seule commande et un seul paiement.

Le backend cree automatiquement :

- une commande globale dans `orders`
- une sous-commande par vendeur dans `seller_orders`
- les lignes de chaque vendeur dans `seller_order_items`
- une livraison par vendeur dans `deliveries`
- un revenu vendeur dans `seller_earnings`
- un paiement global dans `payments`

## Workflow Checkout

1. Le client ajoute des variantes produit au panier.
2. Le checkout charge les lignes du panier depuis `cart_items`.
3. Le backend recalcule tous les prix depuis `product_variants`.
4. Les articles sont groupes par `seller_id`.
5. Pour chaque vendeur, le backend calcule :
   - sous-total vendeur
   - frais de livraison vendeur
   - delai vendeur
   - commission plateforme
   - revenu net vendeur
6. Le stock est reserve avec verrou SQL `FOR UPDATE`.
7. Une commande globale est creee.
8. Une sous-commande vendeur est creee pour chaque vendeur.
9. Une livraison est creee pour chaque sous-commande.
10. Un paiement global est cree en statut `pending`.
11. Les vendeurs sont notifies.

## Tables Principales

- `users` : clients, vendeurs, administrateurs
- `sellers` : boutiques vendeurs avec statut `pending`, `approved`, `suspended`, `rejected`
- `products` : fiche produit generale
- `product_variants` : prix, stock, SKU, unite et poids par variante
- `orders` : commande globale client
- `seller_orders` : commande par vendeur
- `seller_order_items` : lignes de sous-commande
- `deliveries` : livraison par vendeur
- `payments` : paiement global
- `payment_transactions` : historique Wave, Orange Money, MTN, carte, remboursements
- `seller_earnings` : revenus vendeurs
- `seller_payouts` : retraits vendeurs
- `stock_movements` : historique du stock
- `stock_reservations` : reservations temporaires
- `refunds` : remboursements complets ou partiels
- `returns` : retours produit
- `notifications` : dashboard, email, SMS, WhatsApp

## Regles Importantes

- Le frontend ne decide jamais du prix final.
- Le checkout doit toujours recalculer les prix, frais et stocks cote serveur.
- Le panier pointe vers `variant_id`, pas seulement `product_id`.
- Le stock est gere au niveau `product_variants`.
- Les frais de livraison sont au niveau `seller_orders` et `deliveries`.
- Les commissions sont historisees dans `seller_orders` et `seller_earnings`.
- Les anciens prix sont copies dans `seller_order_items` pour garder l'historique.

## API Ajoutee

Base actuelle :

```txt
POST /public/api/index.php?route=/auth/register
POST /public/api/index.php?route=/auth/login
GET  /public/api/index.php?route=/auth/me
POST /public/api/index.php?route=/auth/logout
GET  /public/api/index.php?route=/metadata
GET  /public/api/index.php?route=/products
GET  /public/api/index.php?route=/cart&cart_id=1
POST /public/api/index.php?route=/cart/items
POST /public/api/index.php?route=/delivery/estimate
GET  /public/api/index.php?route=/seller/dashboard&seller_id=1
POST /public/api/index.php?route=/sellers/apply
POST /public/api/index.php?route=/admin/sellers/status
POST /public/api/index.php?route=/seller/products
POST /public/api/index.php?route=/checkout
```

Payload checkout exemple :

```json
{
  "cart_id": 1,
  "customer_name": "Client Test",
  "customer_phone": "+2250102030405",
  "customer_email": "client@example.com",
  "delivery_region_id": 1,
  "delivery_address": "Cocody, Abidjan",
  "payment_provider": "wave"
}
```

## Prochaines Etapes

1. Importer `database/marketplace_schema.sql` dans MySQL.
2. Creer quelques vendeurs, produits, variantes et regions de test.
3. Modifier `boutique.html` pour charger `/products` au lieu du tableau JavaScript statique.
4. Modifier `panier.html` pour envoyer des `variant_id` au backend.
5. Ajouter les pages vendeur :
   - inscription vendeur
   - dashboard
   - produits
   - variantes
   - commandes
   - revenus
6. Ajouter l'authentification et les middlewares de permission.
7. Brancher les vrais providers de paiement.

## Comptes Demo

Apres import de `database/marketplace_seed_demo.sql`, les comptes demo utilisent le mot de passe `password`.

```txt
admin@sibio.local   -> admin
riz@sibio.local     -> vendeur
huile@sibio.local   -> vendeur
savon@sibio.local   -> vendeur
client@sibio.local  -> client
```

## Securite Actuelle

Deja en place :

- sessions PHP avec cookies `HttpOnly`, `SameSite=Lax`, `Secure` si HTTPS
- mots de passe hashes avec `password_hash`
- routes admin protegees par role `admin`
- routes vendeur protegees par role `seller` et boutique `approved`
- fallback `seller_id` uniquement si aucune session n'est active, pour les tests locaux
- un vendeur connecte ne peut pas gerer les produits ou commandes d'un autre vendeur
- checkout serveur avec recalcul des prix, frais et stock
- reservation de stock avec `SELECT ... FOR UPDATE`

A ajouter avant production :

- token CSRF sur les formulaires web
- rate limiting sur login, inscription, checkout et paiement
- verification stricte des webhooks paiement
- logs applicatifs persistants
- permissions admin plus fines
- validation et stockage securise des uploads image
- HTTPS obligatoire

## Erreurs A Eviter

- Creer seulement `orders` et `order_items` sans `seller_orders`.
- Melanger commande client, commande vendeur et livraison dans une seule table.
- Gerer le stock dans `products` au lieu de `product_variants`.
- Accepter le total envoye par JavaScript.
- Decrementer le stock sans transaction.
- Oublier les remboursements partiels.
- Payer le vendeur avant livraison ou avant la fin du delai de litige.
